/**
 * KIVA dev mock backend — implements the storefront part of kiva-openapi.yml (v1.2.0) in memory,
 * with the design's sample data, so every page can be developed and checked before the real API exists.
 *
 *   npm run mock        → http://localhost:8080/api/v1
 *
 * Env: MOCK_PORT (8080) · MOCK_FE_ORIGIN (http://localhost:3000, where the fake bank returns to) · MOCK_DELAY (ms, 180)
 * OTP: any 5-digit code works except 00000 (→ OTP_INVALID).
 * Payments: `payment.redirect` opens a fake bank page (`/mock-gateway/:id`) with «پرداخت موفق» / «انصراف».
 * Order actions (account): a new user gets one order in every state (unpaid, failed, expired, reserved, photo
 * waiting / approved / change requested, shipped, delivered, return requested, cancelled). Demo answers:
 * paying from the account with «بانک سامان» → PAYMENT_GATEWAY_UNAVAILABLE (as in the design);
 * «کلاچ مهتاب» can't be reserved (ITEM_NOT_RESERVABLE); unpaid orders expire 15 minutes after placing.
 */
import http from "node:http";
import { randomUUID } from "node:crypto";
import { bagSVG, postCover } from "./art.mjs";
import * as D from "./data.mjs";

const PORT = Number(process.env.MOCK_PORT || 8080);
const FE_ORIGIN = process.env.MOCK_FE_ORIGIN || "http://localhost:3000";
const DELAY = Number(process.env.MOCK_DELAY ?? 180);
const ORIGIN = `http://localhost:${PORT}`;
const API = "/api/v1";
const DAY = 864e5;
const TZ = "Asia/Tehran";

// ───────────────────────────── helpers ─────────────────────────────
const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (v) => String(v).replace(/\d/g, (d) => FA[d]);
const price = (n) => fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
const toEn = (v) => String(v ?? "").replace(/[۰-۹]/g, (d) => FA.indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const normQ = (s) => toEn(s).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌+/g, "‌").trim();
const iso = (t) => new Date(t).toISOString();
const jdate = (t, o) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: TZ, ...(o || { year: "numeric", month: "2-digit", day: "2-digit" }) }).format(new Date(t));
const tehranDate = (t) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t));
const tehranWeekday = (t) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(t));
const validPhone = (v) => /^09\d{9}$/.test(toEn(v).replace(/\D/g, ""));
const rid = (p) => `${p}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class ApiError extends Error {
	constructor(status, code, message, extra = {}) {
		super(message);
		Object.assign(this, { status, code, extra });
	}
}
const fail = (status, code, message, extra) => { throw new ApiError(status, code, message, extra); };
const validation = (errors) => fail(400, "VALIDATION_ERROR", "چند تا از فیلدها رو باید درست کنی", { errors });

// ───────────────────────────── catalogue views ─────────────────────────────
const getP = (id) => D.PRODUCTS.find((p) => p.id === Number(id));
const catOf = (p) => D.CATEGORIES.find((c) => c.slug === p.cat);
const catRef = (c) => ({ id: c.id, slug: c.slug, name: c.name });
const color = (k) => ({ ...D.COLOR_BY_KEY[k] });
const offPct = (p) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
const variantId = (p, k) => p.id * 100 + p.colors.indexOf(k) + 1;
const variantById = (vid) => {
	const p = getP(Math.floor(Number(vid) / 100));
	const k = p && p.colors[(Number(vid) % 100) - 1];
	return k ? { p, k } : null;
};
const img = (p, k, v = 0) => `${ORIGIN}/media/bag/${p.bag}/${k}.svg?v=${v}&r=2`;
const media = (p, k, v = 0, extra = {}) => ({
	id: `med_${p.id}_${k}_${v}`, type: "IMAGE", url: img(p, k, v), thumbnailUrl: img(p, k, v), width: 1200, height: 1200,
	mimeType: "image/svg+xml", alt: `${p.n} رنگ ${D.COLOR_BY_KEY[k].name}`, ...extra,
});
const stockStatus = (n) => (n === 0 ? "OUT_OF_STOCK" : n < 5 ? "LOW_STOCK" : "IN_STOCK");
const stockInfo = (p) => {
	const status = stockStatus(p.stock);
	return {
		status,
		availableQuantity: status === "LOW_STOCK" ? p.stock : null,
		maxOrderQuantity: Math.min(p.stock, 5),
		label: status === "OUT_OF_STOCK" ? "ناموجود" : status === "LOW_STOCK" ? `فقط ${fa(p.stock)} عدد در انبار باقی مونده` : "موجود در انبار",
	};
};
const priceInfo = (p) => ({
	price: p.price, compareAtPrice: p.old || null, discountPercent: offPct(p), discountAmount: p.old ? p.old - p.price : 0, currency: "IRT",
});
const badges = (p) => {
	const b = [];
	if (p.isNew) b.push({ code: "NEW", label: "جدید", tone: "DEFAULT", icon: null });
	if (offPct(p) && p.stock) b.push({ code: "SALE", label: `${fa(offPct(p))}٪ تخفیف`, tone: "SALE", icon: null });
	if (p.video) b.push({ code: "HAS_VIDEO", label: "ویدیو دارد", tone: "GLASS", icon: "play" });
	if (p.price >= D.FREE_POST) b.push({ code: "FREE_SHIPPING", label: "ارسال رایگان", tone: "DEFAULT", icon: null });
	if (p.stock === 0) b.push({ code: "SOLD_OUT", label: "تمام شد", tone: "DARK", icon: null });
	else if (p.stock < 5) b.push({ code: "LOW_STOCK", label: `فقط ${fa(p.stock)} عدد`, tone: "DANGER", icon: null });
	return b;
};
// review id → (phone → helpful); the sample count (3 + i) stands for other shoppers' «آره»
const helpfulVotes = new Map();
const votesOf = (id) => [...(helpfulVotes.get(id)?.values() ?? [])];
const reviewsOf = (p, ctx) => D.REVIEW_SAMPLES.slice(0, 3 + (p.id % 3)).map((r, i, _, id = p.id * 100 + i + 1) => ({
	id, productId: p.id, authorName: r.n, authorInitial: r.n[0], rating: r.r, title: null, text: r.t,
	createdAt: iso(Date.now() - r.daysAgo * DAY), status: "APPROVED", statusLabel: "منتشر شده", isVerifiedBuyer: true,
	purchasedColor: color(p.colors[i % p.colors.length]),
	reply: r.reply ? { text: r.reply, authorName: "کیوا", createdAt: iso(Date.now() - (r.daysAgo - 1) * DAY) } : null,
	helpfulCount: 3 + i + votesOf(id).filter(Boolean).length, myHelpfulVote: (ctx?.user && helpfulVotes.get(id)?.get(ctx.user.phone)) ?? null, media: [], isMine: false,
}));
const ratingSummary = (p) => {
	const rs = reviewsOf(p);
	const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
	return {
		average: Math.round(avg * 10) / 10, count: rs.length,
		distribution: [5, 4, 3, 2, 1].map((s) => { const c = rs.filter((r) => r.rating === s).length; return { stars: s, count: c, percent: Math.round((c / rs.length) * 1000) / 10 }; }),
		verifiedBuyerPercent: 100,
	};
};
const colorOption = (p, k) => ({ variantId: variantId(p, k), color: color(k), stockStatus: stockStatus(p.stock), imageUrl: img(p, k), thumbnailUrl: img(p, k) });
function summary(p, ctx, displayColorKey) {
	const shown = displayColorKey && p.colors.includes(displayColorKey) ? displayColorKey : p.colors[0];
	const r = ratingSummary(p);
	return {
		id: p.id, slug: p.slug, sku: `KV-${1000 + p.id}`, name: p.n, url: `/product/${p.slug}`,
		category: catRef(catOf(p)), bagType: D.BAG_TYPE[p.bag], price: priceInfo(p),
		colors: p.colors.map((k) => colorOption(p, k)), colorsCount: p.colors.length,
		defaultColorKey: p.colors[0], displayColorKey: shown, image: media(p, shown), hoverImage: null,
		badges: badges(p), stock: stockInfo(p), isNew: !!p.isNew, hasVideo: !!p.video,
		rating: { average: r.average, count: r.count }, soldCount: p.sold, freeShippingEligible: p.price >= D.FREE_POST,
		isWishlisted: ctx?.user ? ctx.user.wishlist.some((w) => w.productId === p.id) : null,
	};
}
const VIEWS = [
	{ v: 0, view: "FRONT", label: "نمای جلو" },
	{ v: 3, view: "SIDE", label: "نمای کنار" },
	{ v: 1, view: "DETAIL", label: "جزئیات" },
	{ v: 2, view: "STYLE", label: "استایل" },
];
const descOf = (p) => `${p.n} با ${p.mat}، دوخت دقیق و یراق‌آلات مقاوم طراحی شده تا هم شیک باشه و هم سال‌ها همراهت بمونه. فضای داخلی حساب‌شده‌ش جای وسایل روزمره رو داره و فرم مینیمالش با هر استایلی هماهنگه. عکس‌ها و ویدیوها کاملاً واقعی و بدون ادیت اغراق‌آمیز گرفته شدن؛ چون شعار ما اینه: هرچی ببینی، همون می‌رسه.`;
function detail(p, ctx, colorKey) {
	const cat = catOf(p);
	const S = D.SPEC[p.bag];
	const st = stockInfo(p);
	const alert = ctx.user && stockAlerts.find((a) => a.phone === ctx.user.phone && a.productId === p.id && a.status === "ACTIVE");
	const specTable = [
		{ key: "MATERIAL", label: "جنس", value: p.mat },
		{ key: "DIMENSIONS", label: "ابعاد (طول × ارتفاع × عرض)", value: `${S.dim} سانتی‌متر` },
		{ key: "WEIGHT", label: "وزن", value: S.w },
		{ key: "CLOSURE", label: "نوع بسته شدن", value: S.close },
		{ key: "STRAP", label: "بند و دسته", value: S.strap },
		{ key: "POCKETS", label: "جیب‌ها", value: S.pockets },
		{ key: "COLORS", label: "رنگ‌های موجود", value: p.colors.map((k) => D.COLOR_BY_KEY[k].name).join("، "), swatches: p.colors.map(color) },
		{ key: "OCCASIONS", label: "مناسب برای", value: S.use },
		{ key: "CATEGORY", label: "دسته‌بندی", value: cat.name },
		{ key: "SKU", label: "کد محصول", value: `KV-${fa(1000 + p.id)}` },
	];
	if (st.status === "LOW_STOCK") specTable.push({ key: "STOCK", label: "موجودی انبار", value: `فقط ${fa(p.stock)} عدد باقی مانده`, tone: "DANGER" });
	if (st.status === "OUT_OF_STOCK") specTable.push({ key: "STOCK", label: "موجودی انبار", value: "تمام شد", tone: "DARK" });
	return {
		...summary(p, ctx, colorKey),
		selectedColorKey: colorKey && p.colors.includes(colorKey) ? colorKey : p.colors[0],
		shortDescription: null,
		description: `<p>${descOf(p)}</p>`,
		highlights: [
			`${p.mat} با دوخت دولایه و لبه‌دوزی دستی`,
			"یراق‌آلات فلزی ضدزنگ با روکش طلایی مات",
			"آستر داخلی ضدلک با رنگ یاسی کیوا",
			`موجود در ${fa(p.colors.length)} رنگ: ${p.colors.map((k) => D.COLOR_BY_KEY[k].name).join("، ")}`,
		],
		material: { id: p.id, slug: `mat-${p.id}`, name: p.mat },
		materialDescription: p.mat,
		specTable,
		variants: p.colors.map((k, i) => ({
			id: variantId(p, k), sku: `KV-${1000 + p.id}-${k.slice(0, 3).toUpperCase()}`, color: color(k), isDefault: i === 0,
			price: priceInfo(p), stock: st, hasVideo: !!p.video,
			stockAlertSubscribed: ctx.user && st.status === "OUT_OF_STOCK" ? !!alert : null,
			media: [
				...VIEWS.map((x, j) => ({ ...media(p, k, x.v), view: x.view, viewLabel: x.label, sortOrder: j, isPrimary: j === 0, isUnedited: true })),
				...(p.video ? [{ id: `vid_${p.id}_${k}`, type: "VIDEO", url: `${ORIGIN}/media/video/${p.id}-${k}.mp4`, thumbnailUrl: img(p, k, 2), posterUrl: img(p, k, 2), durationSec: 24, mimeType: "video/mp4", alt: `ویدیوی ${p.n}`, view: "STYLE", viewLabel: "ویدیو", sortOrder: 9, isPrimary: false, isUnedited: true }] : []),
			],
		})),
		breadcrumbs: [{ label: "خانه", url: "/" }, { label: "فروشگاه", url: "/products" }, { label: cat.name, url: `/products?category=${cat.slug}` }, { label: p.n, url: null }],
		ratingSummary: ratingSummary(p),
		policies: { returnable: true, returnWindowDays: 7, reservable: p.reservable !== false, reservationDays: 4, preShipmentPhoto: true, maxPerOrder: 5 },
		perks: [
			{ icon: "truck", title: "ارسال سریع", subtitle: "تیپاکس یا پست" },
			{ icon: "timer", title: "رزرو ۴ روزه", subtitle: "یکجا تحویل بگیر" },
			{ icon: "refresh", title: "۷ روز بازگشت", subtitle: "بدون دردسر" },
		],
		tags: ["مینیمال", "روزمره"],
		campaign: null,
		stockAlert: ctx.user ? { subscribed: !!alert, alertId: alert ? alert.id : null } : null,
		shareUrl: `https://kiva.ir/p/KV-${1000 + p.id}`,
		seo: { title: `${p.n} | کیوا`, description: descOf(p).slice(0, 160), canonicalUrl: `https://kiva.ir/product/${p.slug}` },
		publishedAt: iso(Date.now() - p.age * DAY),
		updatedAt: iso(Date.now() - DAY),
	};
}
const matchQ = (p, q) => {
	if (!q) return true;
	const hay = [p.n, catOf(p).name, ...p.colors.map((k) => D.COLOR_BY_KEY[k].name), p.mat].join(" ");
	return normQ(q).split(/\s+/).every((w) => hay.includes(w));
};
/** `idOrSlug`: digits only → id; upper-case `KV-…` → product code; otherwise → slug. */
function findProduct(idOrSlug) {
	const s = decodeURIComponent(idOrSlug);
	const p = /^\d+$/.test(s) ? getP(s) : /^KV-\d+$/.test(s) ? getP(Number(s.slice(3)) - 1000) : D.PRODUCTS.find((x) => x.slug === s);
	return p || fail(404, "PRODUCT_NOT_FOUND", "این محصول پیدا نشد.");
}
const csv = (v) => (v ? String(v).split(",").map((x) => x.trim()).filter(Boolean) : []);
const bool = (v) => v === "true" || v === "1";
const PRICE_STEP = 10000;
const PMIN = Math.floor(Math.min(...D.PRODUCTS.map((p) => p.price)) / PRICE_STEP) * PRICE_STEP;
const PMAX = Math.ceil(Math.max(...D.PRODUCTS.map((p) => p.price)) / PRICE_STEP) * PRICE_STEP;
function productFilter(q, skip) {
	const f = {
		q: q.q ? normQ(q.q) : "", cats: csv(q.category), colors: csv(q.color),
		min: q.minPrice ? Number(q.minPrice) : null, max: q.maxPrice ? Number(q.maxPrice) : null,
		onSale: bool(q.onSale), inStock: bool(q.inStock), isNew: bool(q.isNew), hasVideo: bool(q.hasVideo),
		ids: csv(q.ids).map(Number),
	};
	const fn = (p) =>
		matchQ(p, f.q) &&
		(skip === "category" || !f.cats.length || f.cats.includes(p.cat)) &&
		(skip === "color" || !f.colors.length || p.colors.some((c) => f.colors.includes(c))) &&
		(skip === "price" || ((f.min == null || p.price >= f.min) && (f.max == null || p.price <= f.max))) &&
		(!f.onSale || p.old > 0) && (!f.inStock || p.stock > 0) && (!f.isNew || p.isNew) && (!f.hasVideo || p.video) &&
		(!f.ids.length || f.ids.includes(p.id));
	return { f, fn };
}
function facets(q) {
	const all = D.PRODUCTS;
	const cat = all.filter(productFilter(q, "category").fn);
	const col = all.filter(productFilter(q, "color").fn);
	const base = all.filter(productFilter(q).fn);
	const { f } = productFilter(q);
	return {
		categories: D.CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: cat.filter((p) => p.cat === c.slug).length, selected: f.cats.includes(c.slug) })),
		colors: D.COLORS.map((c) => ({ value: c.key, label: c.name, count: col.filter((p) => p.colors.includes(c.key)).length, selected: f.colors.includes(c.key), hex: c.hex })),
		materials: [], bagTypes: [],
		price: { min: PMIN, max: PMAX, step: PRICE_STEP },
		onSaleCount: base.filter((p) => p.old).length, inStockCount: base.filter((p) => p.stock).length,
		newCount: base.filter((p) => p.isNew).length, withVideoCount: base.filter((p) => p.video).length,
	};
}
const SORTS = {
	newest: (a, b) => a.age - b.age, bestselling: (a, b) => b.sold - a.sold, price_asc: (a, b) => a.price - b.price,
	price_desc: (a, b) => b.price - a.price, discount_desc: (a, b) => offPct(b) - offPct(a),
	rating_desc: (a, b) => ratingSummary(b).average - ratingSummary(a).average,
};
const pageMeta = (page, size, total) => ({ page, size, totalItems: total, totalPages: Math.max(1, Math.ceil(total / size)), hasNext: page * size < total });
const paginate = (list, q, defSize = 20) => {
	const page = Math.max(1, Number(q.page) || 1), size = Math.min(200, Math.max(1, Number(q.size) || defSize));
	return { items: list.slice((page - 1) * size, page * size), meta: pageMeta(page, size, list.length) };
};
const categoryView = (c) => {
	const ps = D.PRODUCTS.filter((p) => p.cat === c.slug);
	const hero = [...ps].sort((a, b) => b.sold - a.sold)[0];
	return {
		...catRef(c), description: null, icon: { bagType: D.BAG_TYPE[c.bag], colorKey: c.color, imageUrl: null },
		imageUrl: hero ? img(hero, hero.colors[0]) : null, productCount: ps.length, sortOrder: c.id, showInMenu: true,
		seo: { title: `${c.name} | کیوا` },
	};
};

// ───────────────────────────── state ─────────────────────────────
const users = new Map(); // phone → user
const access = new Map(); // accessToken → phone
const accessExpiry = new Map(); // accessToken → ms; past it the token answers 401 TOKEN_EXPIRED (then the FE refreshes)
const ACCESS_TTL = 900; // seconds — `expiresIn`
const refresh = new Map(); // refreshToken → phone
const carts = new Map(); // cartId → cart
const payments = new Map(); // paymentId → { orderCode, phone, gateway, amount, paidAt }
const idempotency = new Map();
const stockAlerts = [];
const pendingReviews = []; // user-submitted reviews (status PENDING)
const uploads = new Map(); // mediaId → { phone, asset }
let USER_SEQ = 1024, ADDR_SEQ = 40, REVIEW_SEQ = 9000, ALERT_SEQ = 70, RETURN_SEQ = 1012, REFUND_SEQ = 30;
const HOLD_MS = 15 * 60e3; // unpaid orders keep their stock this long
const RETURN_DAYS = 7;

const newCart = () => { const c = { id: rid("cart"), items: [], shippingMethod: "POST", reserve: false, code: null, issues: [] }; carts.set(c.id, c); return c; };

function seedUser(u) {
	const now = Date.now();
	const addr = { id: ++ADDR_SEQ, title: null, provinceId: 1, cityId: 101, addressLine: "خیابان ولیعصر، بالاتر از پارک ساعی، کوچه نسترن، پلاک ۱۲، واحد ۴", postalCode: "1965843117", recipientName: "سارا محمدی", recipientPhone: u.phone, isSelfRecipient: true, isDefault: true, createdAt: iso(now - 30 * DAY) };
	u.addresses.push(addr);
	const order = (code, ago, status, reserve, items, msgr, ship, totals, track, mediaViews, extra = {}) => ({
		code, placedAt: now - ago * DAY, status, reserve, items, messenger: msgr, messengerPhone: u.phone, shippingMethod: ship, totals,
		trackingCode: track, mediaViews, address: addressSnapshot(addr), addressId: addr.id, gateway: "ZARINPAL", note: null,
		group: null, returns: [], feedback: null, feedbackDeadline: null, ...extra,
	});
	const MIN = 60e3, HOUR = 36e5;
	const reserved = order("KV-218340", 1.2, 0, true, [{ id: 8, color: "lilac", qty: 1 }], "TELEGRAM", "POST", { full: 590000, prodOff: 0, code: 0, ship: 75000, total: 665000 }, "", []);
	// the reservation group starts at the first order's payment and is never extended
	u.reservation = { rootCode: reserved.code, startedAt: reserved.placedAt, expiresAt: reserved.placedAt + 4 * DAY, addressId: addr.id, shippingMethod: "POST", members: [reserved] };
	reserved.group = u.reservation;
	const returned = order("KV-213004", 12, 3, false, [{ id: 2, color: "black", qty: 1 }], "TELEGRAM", "TIPAX", { full: 1750000, prodOff: 300000, code: 0, ship: 145000, total: 1595000 }, "TPX4820455", [0, 1, 3], { deliveredAt: now - 5 * DAY });
	u.orders.push(
		order("KV-219004", 12 * MIN / DAY, 0, false, [{ id: 2, color: "olive", qty: 1 }, { id: 8, color: "lilac", qty: 1 }], "TELEGRAM", "TIPAX", { full: 2340000, prodOff: 300000, code: 0, ship: 145000, total: 2185000 }, "", [], { paid: false, holdUntil: now + 2 * HOUR }),
		order("KV-218977", 40 * MIN / DAY, 0, false, [{ id: 4, color: "caramel", qty: 1 }], "BALE", "POST", { full: 3290000, prodOff: 500000, code: 0, ship: 75000, total: 2865000 }, "", [], { paid: false, failed: true, holdUntil: now + 2 * HOUR }),
		reserved,
		order("KV-217902", 2.4, 1, false, [{ id: 2, color: "olive", qty: 1 }], "BALE", "TIPAX", { full: 1750000, prodOff: 300000, code: 0, ship: 145000, total: 1595000 }, "", [0, 3, 1, "v"], { feedbackDeadline: now + 1.3 * DAY }),
		order("KV-217455", 2, 1, false, [{ id: 4, color: "caramel", qty: 1 }, { id: 15, color: "brown", qty: 1 }], "RUBIKA", "POST", { full: 4080000, prodOff: 600000, code: 0, ship: 0, total: 3480000 }, "", [0, 3, 1, 2, "v", 1], { feedbackDeadline: now + 1.8 * DAY }),
		order("KV-216880", 3, 1, false, [{ id: 1, color: "black", qty: 1 }], "TELEGRAM", "POST", { full: 1890000, prodOff: 0, code: 0, ship: 75000, total: 1965000 }, "", [0, 3, 1], {
			feedback: { decision: "REQUEST_CHANGE", changeType: "COLOR", orderItemId: 1, desiredVariantId: 102, note: "اگه یاسی‌اش موجوده همون رو بفرستید؛ مشکی برام زیادی رسمیه.", at: now - 5 * HOUR },
		}),
		order("KV-216120", 1.5, 1, false, [{ id: 6, color: "cream", qty: 1 }], "TELEGRAM", "POST", { full: 1290000, prodOff: 0, code: 0, ship: 75000, total: 1365000 }, "", [0, 1, 3], { feedback: { decision: "APPROVE", note: null, at: now - 20 * HOUR } }),
		order("KV-217650", 3, 0, false, [{ id: 15, color: "brown", qty: 1 }, { id: 5, color: "black", qty: 1 }], "RUBIKA", "POST", { full: 1770000, prodOff: 100000, code: 0, ship: 75000, total: 1745000 }, "", [], { paid: false, failed: true, holdUntil: now - 3 * DAY + HOLD_MS }),
		order("KV-215566", 5, 2, false, [{ id: 4, color: "caramel", qty: 1 }, { id: 15, color: "brown", qty: 1 }], "RUBIKA", "POST", { full: 4080000, prodOff: 600000, code: 0, ship: 0, total: 3480000 }, "183920674512039845612307", [0, 3, 1, 2, "v"]),
		order("KV-214410", 5, 3, false, [{ id: 4, color: "caramel", qty: 1 }, { id: 15, color: "brown", qty: 2 }], "RUBIKA", "POST", { full: 4870000, prodOff: 700000, code: 0, ship: 0, total: 4170000 }, "183920674512039845619921", [0, 3, 1, 2, "v"], { deliveredAt: now - 2.4 * DAY }),
		returned,
		order("KV-212200", 2.2, 0, false, [{ id: 8, color: "lilac", qty: 1 }], "TELEGRAM", "POST", { full: 590000, prodOff: 0, code: 0, ship: 75000, total: 665000 }, "", [], {
			cancelledAt: now - 2 * HOUR,
			refund: { id: ++REFUND_SEQ, amount: 665000, method: "ORIGINAL_PAYMENT", status: "PROCESSING", reason: "ORDER_CANCELLED", expectedBy: iso(now + DAY), completedAt: null, referenceId: null },
		}),
		order("KV-209117", 19, 3, false, [{ id: 1, color: "black", qty: 1 }], "TELEGRAM", "TIPAX", { full: 1890000, prodOff: 0, code: 189000, ship: 145000, total: 1846000 }, "TPX4821760", [0, 1, 3]),
	);
	const rt = {
		id: RETURN_SEQ, code: `RT-${RETURN_SEQ}`, orderCode: returned.code, status: "APPROVED", reason: "NOT_AS_PICTURED", description: "رنگش با عکس قبل از ارسال فرق داشت.",
		items: [{ orderItemId: 1, productId: 2, color: "black", quantity: 1 }], media: [], shippingPaidBy: "KIVA", refundMethod: "ORIGINAL_PAYMENT",
		instructions: "کیف رو با بسته‌بندی اصلی و همه‌ی متعلقاتش، با تیپاکس به انبار کیوا بفرست؛ نشانی و کد پس‌کرایه برات پیامک شد و هزینه‌ش با کیواست. شماره‌ی درخواست RT-1012 رو روی بسته بنویس.",
		refund: null, createdAt: now - 26 * HOUR, decidedAt: now - 21 * HOUR,
	};
	returned.returns.push(rt);
	u.returns.push(rt);
	u.wishlist = [3, 7, 12].map((id) => ({ productId: id, addedAt: now - 9 * DAY, colorKey: null, priceAtAdd: getP(id).old || getP(id).price }));
	stockAlerts.push(
		{ id: ++ALERT_SEQ, phone: u.phone, productId: 5, variantId: variantId(getP(5), "lilac"), status: "ACTIVE", createdAt: now - 6 * DAY, notifiedAt: null },
		{ id: ++ALERT_SEQ, phone: u.phone, productId: 14, variantId: null, status: "ACTIVE", createdAt: now - 2 * DAY, notifiedAt: null },
		{ id: ++ALERT_SEQ, phone: u.phone, productId: 9, variantId: variantId(getP(9), "caramel"), status: "NOTIFIED", createdAt: now - 12 * DAY, notifiedAt: now - DAY },
	);
	u.reviews = [
		{ id: ++REVIEW_SEQ, productId: 1, rating: 5, text: "کیف دقیقاً همونی بود که توی عکس قبل از ارسال دیدم. چرمش هم خیلی نرمه.", createdAt: now - 16 * DAY, status: "APPROVED", reply: "ممنون از نظر قشنگت امیدواریم سال‌ها همراهت باشه." },
		{ id: ++REVIEW_SEQ, productId: 4, rating: 4, text: "رنگ کاراملی‌ش فوق‌العاده‌ست، فقط بند بلندش کمی سفته.", createdAt: now - 3 * DAY, status: "APPROVED", reply: "بند چرمی بعد از چند بار استفاده نرم‌تر می‌شه. اگه خواستی، با پشتیبانی در تماس باش تا بند جایگزین برات بفرستیم." },
	];
}
function getUserByPhone(phone, create) {
	let u = users.get(phone);
	if (!u && create) {
		u = {
			id: ++USER_SEQ, phone, firstName: null, lastName: null, email: null, birthDate: null, gender: "UNSPECIFIED",
			defaultMessenger: null, defaultMessengerPhone: null, marketingSmsOptIn: true, createdAt: Date.now(),
			addresses: [], orders: [], wishlist: [], reviews: [], returns: [], reservation: null, cartId: newCart().id,
		};
		seedUser(u);
		users.set(phone, u);
	}
	return u;
}
const userView = (u) => {
	const full = [u.firstName, u.lastName].filter(Boolean).join(" ") || null;
	return {
		id: u.id, phone: u.phone, firstName: u.firstName, lastName: u.lastName, fullName: full,
		displayName: u.firstName || "دوست عزیز", avatarInitial: (u.firstName || "ک")[0], email: u.email, birthDate: u.birthDate,
		gender: u.gender, defaultMessenger: u.defaultMessenger, defaultMessengerPhone: u.defaultMessengerPhone,
		marketingSmsOptIn: u.marketingSmsOptIn, roles: ["CUSTOMER"], createdAt: iso(u.createdAt),
	};
};
function issueTokens(u) {
	const at = rid("at"), rt = rid("rt");
	access.set(at, u.phone); accessExpiry.set(at, Date.now() + ACCESS_TTL * 1000); refresh.set(rt, u.phone);
	return { accessToken: at, refreshToken: rt, tokenType: "Bearer", expiresIn: ACCESS_TTL, refreshExpiresIn: 2592000 };
}
const needUser = (ctx) => ctx.user || fail(401, "UNAUTHORIZED", "اول وارد حساب کاربریت شو.");

// ───────────────────────────── cart ─────────────────────────────
function resolveCart(ctx) {
	if (ctx.user) {
		let c = carts.get(ctx.user.cartId);
		if (!c) { c = newCart(); ctx.user.cartId = c.id; }
		return c;
	}
	const token = ctx.req.headers["x-cart-token"];
	if (token && carts.has(token)) return carts.get(token);
	const c = newCart();
	ctx.headers["X-Cart-Token"] = c.id;
	return c;
}
function codeDiscount(code, subtotal) {
	const c = D.CODES[String(code || "").toUpperCase().trim()];
	if (!c) return { ok: false, code: "DISCOUNT_CODE_INVALID", msg: "این کد تخفیف معتبر نیست" };
	if (c.min && subtotal < c.min) return { ok: false, code: "DISCOUNT_MIN_SUBTOTAL_NOT_MET", msg: `این کد برای خرید بالای ${price(c.min)} تومان فعاله`, meta: { minSubtotal: c.min } };
	const amount = c.type === "PERCENT" ? Math.round((subtotal * c.value) / 100 / 1000) * 1000 : Math.min(c.value, subtotal);
	return { ok: true, amount, label: c.label, type: c.type, value: c.value };
}
const shipName = (m) => D.SHIPPING[m].name;
/** `joining`: the order joins an active reservation — its group's method only, free. */
function shippingOptions(subtotal, count, selected, joining) {
	return ["TIPAX", "POST"].map((m) => {
		const s = D.SHIPPING[m];
		if (joining) {
			const own = m === joining.shippingMethod;
			return {
				method: m, name: s.name, description: s.description, icon: s.icon, baseCost: s.baseCost, cost: own ? 0 : s.baseCost,
				isFree: own, freeReason: own ? "RESERVATION_CONSOLIDATION" : null,
				estimatedDelivery: { minDays: s.minDays, maxDays: s.maxDays, fromDate: tehranDate(Date.now() + s.minDays * DAY), toDate: tehranDate(Date.now() + s.maxDays * DAY) },
				available: own, unavailableReason: own ? null : `سفارش رزروی با ${shipName(joining.shippingMethod)} ارسال می‌شه`, selected: own,
			};
		}
		const free = m === "POST" && subtotal >= D.FREE_POST;
		return {
			method: m, name: s.name, description: s.description, icon: s.icon, baseCost: s.baseCost, cost: !count || free ? 0 : s.baseCost,
			isFree: free, freeReason: free ? "THRESHOLD" : null,
			estimatedDelivery: { minDays: s.minDays, maxDays: s.maxDays, fromDate: tehranDate(Date.now() + s.minDays * DAY), toDate: tehranDate(Date.now() + s.maxDays * DAY) },
			available: true, unavailableReason: null, selected: m === selected,
		};
	});
}
// ── reservation groups ──
/** A group lives until its fixed deadline while at least one paid order of it is still on. */
const groupAlive = (g) => !!g && g.expiresAt > Date.now() && g.members.some((o) => !o.cancelledAt && o.paid !== false);
const activeGroup = (u) => (u && groupAlive(u.reservation) ? u.reservation : null);
function joinOrStartGroup(u, o) {
	const g = activeGroup(u);
	if (g) { o.group = g; if (!g.members.includes(o)) g.members.push(o); return; }
	const now = Date.now();
	u.reservation = { rootCode: o.code, startedAt: now, expiresAt: now + 4 * DAY, addressId: o.addressId, shippingMethod: o.shippingMethod, members: [o] };
	o.group = u.reservation;
}
const reservationInfo = (g) => ({
	active: true, orderCode: g.rootCode, startedAt: iso(g.startedAt), expiresAt: iso(g.expiresAt), remainingSeconds: Math.max(0, Math.round((g.expiresAt - Date.now()) / 1000)),
	groupOrderCodes: g.members.filter((o) => !o.cancelledAt && o.paid !== false).map((o) => o.code),
	message: `تا ${jdate(g.expiresAt, { weekday: "long", day: "numeric", month: "long" })} هر خریدی کنی، با همین سفارش و بدون هزینه ارسال جدید فرستاده می‌شه.`,
});
const consolidationView = (g) => ({
	reservedOrderCode: g.rootCode, expiresAt: iso(g.expiresAt), addressId: g.addressId, shippingWaived: true, shippingMethod: g.shippingMethod,
	message: `این خرید به سفارش رزروی ${g.rootCode} اضافه می‌شه و هزینه ارسال نداره.`,
});
const RESERVATION_MSG = {
	HAS_ACTIVE_RESERVATION: "رزرو فعال داری؛ خریدی که به همون آدرس بفرستی خودکار به سفارش رزروی‌ات اضافه می‌شه.",
	ITEM_NOT_RESERVABLE: "یکی از کالاهای سبدت قابل رزرو نیست.",
	RESERVATION_DISABLED: "رزرو ۴ روزه فعلاً فعال نیست.",
};
function reservationView(c, ctx) {
	const now = Date.now();
	const notReservable = c.items.some((i) => variantById(i.variantId)?.p.reservable === false);
	const reason = activeGroup(ctx.user) ? "HAS_ACTIVE_RESERVATION" : notReservable ? "ITEM_NOT_RESERVABLE" : null;
	if (reason) c.reserve = false; // the switch can't stay on
	return {
		available: !reason, unavailableReason: reason, enabled: !reason && !!c.reserve, holdDays: 4, shipAfterDate: tehranDate(now + 4 * DAY),
		timeline: [
			{ title: `امروز، ${jdate(now, { day: "numeric", month: "long" })}`, text: "پرداخت کامل و ثبت سفارش" },
			{ title: `تا ${jdate(now + 4 * DAY, { weekday: "long", day: "numeric", month: "long" })}`, text: "هر محصول دیگه‌ای خواستی به همین سفارش اضافه کن" },
			{ title: "بعد از ۴ روز", text: "همه با هم و با یک هزینه ارسال فرستاده می‌شن" },
		],
	};
}
/** `opts.addressId`: the address the order goes to (checkout) — joining a reservation is per address; the cart uses the default one. */
function cartView(c, ctx, opts = {}) {
	const items = c.items.filter((i) => variantById(i.variantId)).map((i) => {
		const { p, k } = variantById(i.variantId);
		const unitCompare = p.old || p.price;
		return {
			id: i.id, productId: p.id, variantId: i.variantId,
			product: { id: p.id, slug: p.slug, sku: `KV-${1000 + p.id}`, name: p.n, category: catRef(catOf(p)), url: `/product/${p.slug}?color=${k}` },
			color: color(k), image: media(p, k), quantity: i.qty, maxQuantity: p.stock,
			unitPrice: p.price, unitCompareAtPrice: p.old || null, lineTotal: p.price * i.qty, lineCompareAtTotal: p.old ? p.old * i.qty : null,
			lineDiscount: (unitCompare - p.price) * i.qty, stock: stockInfo(p),
			isWishlisted: ctx.user ? ctx.user.wishlist.some((w) => w.productId === p.id) : null, addedAt: iso(i.addedAt),
		};
	});
	const itemsCount = items.reduce((s, i) => s + i.quantity, 0);
	const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
	const full = items.reduce((s, i) => s + (i.unitCompareAtPrice || i.unitPrice) * i.quantity, 0);
	let discount = null;
	if (c.code) {
		const d = codeDiscount(c.code, subtotal);
		if (d.ok) discount = { code: c.code, label: d.label, type: d.type, value: d.value, amount: d.amount };
		else { c.code = null; c.issues.push({ code: "DISCOUNT_REMOVED", itemId: null, message: "کد تخفیف دیگه برای این سبد معتبر نیست و حذف شد." }); }
	}
	const reservation = reservationView(c, ctx);
	const group = activeGroup(ctx.user);
	const addressId = "addressId" in opts ? opts.addressId : (ctx.user?.addresses.find((a) => a.isDefault) ?? ctx.user?.addresses[0])?.id;
	const consolidation = group && addressId === group.addressId ? consolidationView(group) : null;
	const method = consolidation ? consolidation.shippingMethod : c.shippingMethod;
	const options = shippingOptions(subtotal, itemsCount, method, consolidation);
	const ship = options.find((o) => o.method === method);
	const codeAmount = discount ? discount.amount : 0;
	const issues = c.issues; c.issues = [];
	return {
		id: c.id, isGuest: !ctx.user, items,
		totals: {
			itemsCount, linesCount: items.length, itemsCompareAtTotal: full, productDiscount: full - subtotal, subtotal, codeDiscount: codeAmount,
			shippingCost: itemsCount ? ship.cost : 0, shippingIsFree: !!(itemsCount && ship.cost === 0),
			payable: Math.max(0, subtotal - codeAmount + (itemsCount ? ship.cost : 0)), totalSavings: full - subtotal + codeAmount, currency: "IRT",
		},
		shippingMethod: method, shippingOptions: options,
		// joining a reservation ships free whatever the amount
		freeShipping: consolidation
			? { threshold: D.FREE_POST, method: consolidation.shippingMethod, eligible: true, remaining: 0, progressPercent: 100, message: "ارسال این خرید رایگانه؛ با سفارش رزروی‌ات فرستاده می‌شه." }
			: {
				threshold: D.FREE_POST, method: "POST", eligible: subtotal >= D.FREE_POST, remaining: Math.max(0, D.FREE_POST - subtotal),
				progressPercent: Math.min(100, Math.round((subtotal / D.FREE_POST) * 1000) / 10),
				message: subtotal >= D.FREE_POST ? "ارسال با پست برات رایگانه!" : `فقط ${price(D.FREE_POST - subtotal)} تومان تا ارسال رایگان با پست`,
			},
		reservation, consolidation, discount, issues,
		checkoutRequiresLogin: !ctx.user, updatedAt: iso(Date.now()),
	};
}
const mutation = (c, ctx, extra = {}) => ({ cart: cartView(c, ctx), affectedItemId: null, removedItem: null, message: null, ...extra });
function addToCart(c, vid, qty) {
	const v = variantById(vid) || fail(404, "VARIANT_NOT_FOUND", "این رنگ از محصول پیدا نشد.");
	if (!v.p.stock) fail(422, "OUT_OF_STOCK", "این کالا فعلاً موجود نیست.");
	let line = c.items.find((i) => i.variantId === Number(vid));
	const want = (line ? line.qty : 0) + qty;
	const final = Math.min(want, v.p.stock);
	if (final < want) c.issues.push({ code: "QUANTITY_REDUCED", itemId: line?.id ?? null, message: `حداکثر موجودی: ${fa(v.p.stock)} عدد`, previousValue: want, currentValue: final });
	if (line) line.qty = final; else { line = { id: rid("ci"), variantId: Number(vid), qty: final, addedAt: Date.now() }; c.items.push(line); }
	return { line, v, qty: final };
}

// ───────────────────────────── orders ─────────────────────────────
function addressSnapshot(a) {
	const prov = D.PROVINCES.find((p) => p.id === a.provinceId);
	const city = prov?.cities.find((x) => x.id === a.cityId);
	const provinceName = prov?.name ?? "", cityName = city?.name ?? "";
	return { provinceName, cityName, addressLine: a.addressLine, postalCode: a.postalCode, recipientName: a.recipientName, recipientPhone: a.recipientPhone, fullText: `${provinceName}، ${cityName}، ${a.addressLine}` };
}
const addressView = (a) => ({ ...a, ...(({ provinceName, cityName, fullText }) => ({ provinceName, cityName, fullText }))(addressSnapshot(a)) });
const MSGR_NAME = { RUBIKA: "روبیکا", TELEGRAM: "تلگرام", BALE: "بله", INSTAGRAM: "اینستاگرام" };
const STEPS = [["PLACED", "ثبت شد", "check"], ["PHOTO_SENT", "عکس ارسال شد", "camera"], ["SHIPPED", "تحویل پست شد", "truck"], ["DELIVERED", "تحویل شد", "home"]];
const isReserved = (o) => !!o.group && groupAlive(o.group) && o.paid !== false && !o.cancelledAt && o.status === 0;
const isExpired = (o) => o.paid === false && !o.cancelledAt && !!o.holdUntil && o.holdUntil <= Date.now();
const deliveredAt = (o) => o.deliveredAt ?? o.placedAt + 3 * DAY * 0.9;
const returnDeadline = (o) => deliveredAt(o) + RETURN_DAYS * DAY;
/** The order's latest request that wasn't rejected. */
const liveReturn = (o) => [...(o.returns || [])].reverse().find((r) => r.status !== "REJECTED");
/** How many of line `j` can still be returned. */
const remainingQty = (o, j) => o.items[j].qty - (o.returns || []).filter((r) => r.status !== "REJECTED").flatMap((r) => r.items).filter((i) => i.orderItemId === j + 1).reduce((n, i) => n + i.quantity, 0);
const canReturn = (o) => o.status === 3 && !o.cancelledAt && Date.now() < returnDeadline(o) && o.items.some((_, j) => remainingQty(o, j) > 0);
function statusOf(o) {
	if (o.cancelledAt) return { status: "CANCELLED", statusLabel: "لغو شده", statusTone: "DANGER" };
	if (isExpired(o)) return { status: "EXPIRED", statusLabel: "منقضی شد", statusTone: "DANGER" };
	if (o.paid === false && o.failed) return { status: "PAYMENT_FAILED", statusLabel: "پرداخت ناموفق", statusTone: "DANGER" };
	if (o.paid === false) return { status: "PENDING_PAYMENT", statusLabel: "در انتظار پرداخت", statusTone: "WARN" };
	if (isReserved(o)) return { status: "RESERVED", statusLabel: "رزرو شده", statusTone: "CREAM" };
	const ret = o.status === 3 && liveReturn(o);
	if (ret) return ret.status === "REFUNDED" ? { status: "REFUNDED", statusLabel: "وجه برگشت داده شد", statusTone: "DEFAULT" } : { status: "RETURN_REQUESTED", statusLabel: "درخواست مرجوعی", statusTone: "WARN" };
	if (o.status === 1 && o.feedback?.decision === "REQUEST_CHANGE") return { status: "CHANGE_REQUESTED", statusLabel: "درخواست تغییر ثبت شد", statusTone: "WARN" };
	return [
		{ status: "PROCESSING", statusLabel: "در حال آماده‌سازی", statusTone: "WARN" },
		{ status: "PHOTO_SENT", statusLabel: "عکس کیف ارسال شد", statusTone: "DEFAULT" },
		{ status: "SHIPPED", statusLabel: "در مسیر", statusTone: "DEFAULT" },
		{ status: "DELIVERED", statusLabel: "تحویل شده", statusTone: "SUCCESS" },
	][o.status];
}
const progressOf = (o) => ({
	currentStepIndex: o.status,
	steps: STEPS.map(([key, label, icon], i) => ({
		key, label, icon,
		state: i < o.status || o.status === 3 ? "DONE" : i === o.status ? "CURRENT" : "UPCOMING",
		at: i <= o.status ? iso(i === 3 ? deliveredAt(o) : o.placedAt + i * (o.reserve && i === 1 ? 4 : 1) * DAY * 0.9) : null,
	})),
});
const firstItem = (o) => ({ p: getP(o.items[0].id), k: o.items[0].color });
function mediaItems(o) {
	const { p, k } = firstItem(o);
	return o.mediaViews.map((m, i) => m === "v"
		? { id: `om_${o.code}_${i}`, type: "VIDEO", url: `${ORIGIN}/media/video/${o.code}.mp4`, thumbnailUrl: img(p, k, 2), posterUrl: img(p, k, 2), durationSec: 24, mimeType: "video/mp4", alt: "ویدیوی کیف شما", view: "STYLE", capturedAt: iso(o.placedAt + 0.9 * DAY), orderItemId: 1 }
		: { ...media(p, k, m), id: `om_${o.code}_${i}`, view: ["FRONT", "DETAIL", "STYLE", "SIDE"][m], capturedAt: iso(o.placedAt + 0.9 * DAY), orderItemId: 1 });
}
const mediaStatus = (o) => (!o.mediaViews.length ? "WAITING" : o.feedback ? (o.feedback.decision === "APPROVE" ? "APPROVED" : "CHANGE_REQUESTED") : "SENT");
const CANCELLABLE = ["PENDING_PAYMENT", "PAYMENT_FAILED", "RESERVED", "PROCESSING", "PHOTO_SENT", "CHANGE_REQUESTED"];
function orderSummary(o) {
	const st = statusOf(o);
	const s = D.SHIPPING[o.shippingMethod];
	return {
		code: o.code, placedAt: iso(o.placedAt), ...st, payable: o.totals.total,
		shippingMethod: { code: o.shippingMethod, name: s.name },
		itemsPreview: o.items.map((i) => ({ productId: i.id, name: getP(i.id).n, colorKey: i.color, imageUrl: img(getP(i.id), i.color), quantity: i.qty })),
		itemsCount: o.items.reduce((n, i) => n + i.qty, 0),
		progress: progressOf(o),
		reservation: isReserved(o) ? reservationInfo(o.group) : null,
		shipment: {
			carrier: o.shippingMethod, carrierName: s.name, trackingCode: o.trackingCode || null, trackingUrl: o.trackingCode ? s.trackingUrl : null,
			shippedAt: o.status >= 2 ? iso(o.placedAt + 2 * DAY * 0.9) : null, deliveredAt: o.status >= 3 ? iso(deliveredAt(o)) : null,
			waitingMessage: o.trackingCode ? null : o.status < 2 ? `بعد از تحویل به ${s.name} این‌جا نمایش داده می‌شه` : "—",
		},
		preShipmentMedia: {
			status: mediaStatus(o), channel: o.messenger, channelName: MSGR_NAME[o.messenger],
			count: o.mediaViews.length, hasVideo: o.mediaViews.includes("v"), sentAt: o.mediaViews.length ? iso(o.placedAt + 0.9 * DAY) : null,
		},
		actions: {
			canCancel: CANCELLABLE.includes(st.status), canRequestChange: st.status === "PHOTO_SENT" && !o.feedback, canApproveMedia: st.status === "PHOTO_SENT" && !o.feedback,
			canReturn: canReturn(o), canPay: st.status === "PENDING_PAYMENT" || st.status === "PAYMENT_FAILED", canAddToReservation: st.status === "RESERVED", canReview: o.status === 3 && !o.cancelledAt,
		},
	};
}
function orderDetail(o) {
	const s = D.SHIPPING[o.shippingMethod];
	return {
		...orderSummary(o),
		items: o.items.map((i, j) => {
			const p = getP(i.id);
			return {
				id: j + 1, productId: p.id, variantId: variantId(p, i.color), sku: `KV-${1000 + p.id}`, name: p.n, slug: p.slug, color: color(i.color),
				image: media(p, i.color), quantity: i.qty, unitPrice: p.price, unitCompareAtPrice: p.old || null, lineTotal: p.price * i.qty,
				reviewed: false, returnableUntil: o.status === 3 && !o.cancelledAt ? iso(returnDeadline(o)) : null,
			};
		}),
		address: o.address,
		totals: {
			itemsCompareAtTotal: o.totals.full, productDiscount: o.totals.prodOff, subtotal: o.totals.full - o.totals.prodOff,
			discountCode: o.totals.code ? "KIVA10" : null, codeDiscount: o.totals.code, shippingCost: o.totals.ship,
			shippingFreeReason: o.totals.ship ? null : o.group && o.group.rootCode !== o.code ? "RESERVATION_CONSOLIDATION" : "THRESHOLD", giftWrapCost: 0, payable: o.totals.total,
			refunded: o.refund?.status === "COMPLETED" ? o.refund.amount : 0, currency: "IRT",
		},
		payment: o.paid === false
			? { gateway: o.gateway, gatewayName: D.GATEWAYS.find((g) => g.code === o.gateway).name, status: isExpired(o) ? "EXPIRED" : o.failed ? "FAILED" : "PENDING", referenceId: null, paidAt: null, cardMask: null }
			: { gateway: o.gateway, gatewayName: D.GATEWAYS.find((g) => g.code === o.gateway).name, status: "SUCCEEDED", referenceId: String(201843917 + o.placedAt % 1000), paidAt: iso(o.placedAt), cardMask: "6037-99**-****-1234" },
		preShipmentMediaDetail: {
			status: mediaStatus(o), channel: o.messenger, channelName: MSGR_NAME[o.messenger], phone: o.messengerPhone, note: o.note,
			sentAt: o.mediaViews.length ? iso(o.placedAt + 0.9 * DAY) : null,
			waitingMessage: o.mediaViews.length ? null : `${isReserved(o) ? "سفارشت در حالت رزروه. " : ""}قبل از ارسال، از کیفت عکس و ویدیو می‌گیریم و توی ${MSGR_NAME[o.messenger]} برات می‌فرستیم؛ یه نسخه هم همین‌جا قرار می‌گیره.`,
			items: mediaItems(o),
			feedback: o.feedback ? { decision: o.feedback.decision, note: o.feedback.note ?? null, at: iso(o.feedback.at) } : null,
			feedbackDeadline: o.feedbackDeadline && !o.feedback ? iso(o.feedbackDeadline) : null,
		},
		timeline: progressOf(o).steps.filter((x) => x.at).map((x, i) => ({ status: ["PROCESSING", "PHOTO_SENT", "SHIPPED", "DELIVERED"][i], label: x.label, at: x.at, note: null })),
		customerNote: null, gift: null, returns: (o.returns || []).map(returnView),
		invoiceUrl: o.paid !== false && !o.cancelledAt ? `/api/v1/me/orders/${o.code}/invoice` : null,
		shipmentCarrierUrl: s.trackingUrl,
	};
}
const RETURN_LABEL = { REQUESTED: "در حال بررسی", APPROVED: "تأیید شد", PICKUP_SCHEDULED: "زمان دریافت تعیین شد", RECEIVED: "کیف رسید", REFUNDED: "وجه برگشت داده شد", REJECTED: "رد شد", CLOSED: "بسته شد" };
const returnView = (r) => ({
	id: r.id, code: r.code, orderCode: r.orderCode, status: r.status, statusLabel: RETURN_LABEL[r.status], reason: r.reason, description: r.description || null,
	items: r.items.map((i) => ({ orderItemId: i.orderItemId, name: getP(i.productId).n, color: color(i.color), quantity: i.quantity })),
	media: r.media, shippingPaidBy: r.shippingPaidBy, instructions: r.instructions, refund: r.refund,
	createdAt: iso(r.createdAt), decidedAt: r.decidedAt ? iso(r.decidedAt) : null,
});
function findOrderByCode(code) {
	for (const u of users.values()) { const o = u.orders.find((x) => x.code === code); if (o) return { u, o }; }
	return null;
}

// ───────────────────────────── home / content ─────────────────────────────
const friday = () => {
	// end of this week (Friday 24:00 Tehran) — the campaign countdown target, like the design
	const end = new Date(); end.setHours(24, 0, 0, 0); end.setDate(end.getDate() + ((5 - end.getDay() + 7) % 7)); return end.getTime();
};
const satisfaction = () => ({
	averageRating: 4.9, scale: 5, totalCount: 2480,
	metrics: [{ key: "PHOTO_MATCH", label: "تطابق با عکس", percent: 98 }, { key: "QUALITY", label: "کیفیت و دوخت", percent: 96 }, { key: "SHIPPING_SPEED", label: "سرعت ارسال", percent: 94 }],
	sources: ["RUBIKA", "TELEGRAM", "BALE", "INSTAGRAM"],
});
const testimonials = () => D.TESTIMONIALS.map((t, i) => {
	const p = getP(t.p);
	return {
		id: i + 1, customerName: t.n, customerInitial: t.n[0], city: t.c, source: t.s, sourceName: MSGR_NAME[t.s], message: t.t,
		messageTime: `${10 + (i % 9)}:${String(12 + i * 5).padStart(2, "0")}`, receivedAt: iso(Date.now() - (i + 1) * DAY), rating: 5,
		product: { id: p.id, slug: p.slug, sku: `KV-${1000 + p.id}`, name: p.n, imageUrl: img(p, t.col), colorKey: t.col }, color: color(t.col), screenshotUrl: null,
	};
});
const saleProducts = (ctx) => D.PRODUCTS.filter((p) => p.old && p.stock).sort((a, b) => offPct(b) - offPct(a)).slice(0, 4).map((p) => summary(p, ctx));
const campaign = (ctx) => ({
	id: 5, slug: "paeez-1405", title: "جشنواره پاییزه", subtitle: "تا پایان جشنواره فرصت داری:", icon: "fire",
	startsAt: iso(Date.now() - 6 * DAY), endsAt: iso(friday()), serverTime: iso(Date.now()), products: saleProducts(ctx), seeAllUrl: "/products?onSale=true", isActive: true,
});
const isOpenNow = () => {
	const d = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
	const h = d.getHours() + d.getMinutes() / 60, wd = d.getDay();
	return wd === 5 ? false : wd === 4 ? h >= 10 && h < 18 : h >= 9 && h < 21;
};
const siteConfig = () => ({
	brand: { name: "کیوا", slogan: "هرچی ببینی، همون می‌رسه.", about: "کیوا فروشگاه آنلاین کیف‌های مینیمال و باکیفیته. قبل از ارسال، از همون کیفی که برات کنار گذاشتیم عکس می‌گیریم و برات می‌فرستیم تا با خیال راحت خرید کنی.", logoUrl: "/images/logo/kiva-logo-primary.svg", logoWhiteUrl: "/images/logo/kiva-logo-white.svg", faviconUrl: "/icon.svg" },
	currency: { code: "IRT", label: "تومان" },
	announcements: [
		{ id: 1, icon: "camera", text: "هرچی ببینی، همون می‌رسه — قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم", url: null, sortOrder: 1 },
		{ id: 2, icon: "truck", text: `ارسال رایگان با پست برای خریدهای بالای ${price(D.FREE_POST)} تومان`, url: null, sortOrder: 2 },
		{ id: 3, icon: "timer", text: "رزرو ۴ روزه: الان بخر، چند روز بعد همه رو یکجا تحویل بگیر", url: null, sortOrder: 3 },
	],
	shipping: {
		methods: ["TIPAX", "POST"].map((m) => ({ code: m, name: D.SHIPPING[m].name, description: D.SHIPPING[m].description, baseCost: D.SHIPPING[m].baseCost, minDays: D.SHIPPING[m].minDays, maxDays: D.SHIPPING[m].maxDays, icon: D.SHIPPING[m].icon, isActive: true })),
		freeShippingThreshold: D.FREE_POST, freeShippingMethods: ["POST"], nonShippingWeekdays: ["FRIDAY"],
	},
	reservation: { enabled: true, holdDays: 4, description: "الان کامل پرداخت کن، ۴ روز بعد برات ارسال می‌شه." },
	returns: { windowDays: 7, policyUrl: "/faq#return" },
	preShipmentPhoto: { enabled: true, required: true, channels: D.MESSENGERS, title: "قبل از ارسال، عکس همین کیف رو می‌بینی", description: "بعد از ثبت سفارش، از کیفی که برات کنار می‌ذاریم عکس و ویدیو می‌گیریم و توی پیام‌رسانت می‌فرستیم." },
	inventory: { lowStockThreshold: 5 },
	auth: { otpLength: 5, resendCooldownSeconds: 120 },
	support: {
		phone: "02191001234", phoneDisplay: "۰۲۱-۹۱۰۰۱۲۳۴", email: "support@kiva.ir", emailResponseHint: "پاسخ تا ۲۴ ساعت", responseTimeHint: "معمولاً کمتر از یک ساعت جواب می‌دیم",
		hours: [
			{ label: "شنبه تا چهارشنبه", weekdays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY"], from: "09:00", to: "21:00", messengerOnly: false },
			{ label: "پنجشنبه", weekdays: ["THURSDAY"], from: "10:00", to: "18:00", messengerOnly: false },
			{ label: "جمعه و تعطیلات", weekdays: ["FRIDAY"], from: null, to: null, messengerOnly: true },
		],
		isOpenNow: isOpenNow(),
	},
	social: D.SOCIAL,
	paymentGateways: D.GATEWAYS,
	productPerks: [{ icon: "truck", title: "ارسال سریع", subtitle: "تیپاکس یا پست" }, { icon: "timer", title: "رزرو ۴ روزه", subtitle: "یکجا تحویل بگیر" }, { icon: "refresh", title: "۷ روز بازگشت", subtitle: "بدون دردسر" }],
	trustBadges: [{ type: "ENAMAD", label: "نماد اعتماد الکترونیکی", imageUrl: null, linkUrl: "#" }, { type: "SAMANDEHI", label: "نشان ساماندهی", imageUrl: null, linkUrl: "#" }],
	footerLinks: [
		{ group: "فروشگاه", links: [...D.CATEGORIES.slice(0, 5).map((c) => ({ label: c.name, url: `/products?category=${c.slug}` })), { label: "تخفیف‌دارها", url: "/products?onSale=true" }] },
		{ group: "راهنمای خرید", links: [{ label: "پیگیری سفارش", url: "/track" }, { label: "کدهای رهگیری روزانه", url: "/track#daily" }, { label: "سوالات متداول", url: "/faq" }, { label: "رزرو ۴ روزه", url: "/faq#reserve" }, { label: "شرایط ارسال", url: "/faq#shipping" }, { label: "بازگشت کالا", url: "/faq#return" }, { label: "قوانین و حریم خصوصی", url: "/pages/terms" }] },
	],
	features: { wishlistShare: true, reviewMedia: false, giftWrap: false },
});

// blog
const blogCats = () => [...new Map(D.POSTS.map((p) => [p.catSlug, p.cat])).entries()].map(([slug, name], i) => ({ id: i + 1, slug, name, postCount: D.POSTS.filter((p) => p.catSlug === slug).length }));
const blogCat = (p) => blogCats().find((c) => c.slug === p.catSlug);
const author = (p) => ({ id: 1, name: p.au, title: p.au.split("—")[1]?.trim() || "تیم کیوا", initial: p.au[0], avatarUrl: null, bio: D.AUTHOR_BIO });
const coverAsset = (p, kind) => ({ id: `cov_${p.id}_${kind}`, type: "IMAGE", url: `${ORIGIN}/media/post/${p.id}.svg?kind=${kind}`, alt: p.t, mimeType: "image/svg+xml" });
const postSummary = (p, kind = "card") => ({
	id: p.id, slug: p.slug, title: p.t, excerpt: p.ex, category: blogCat(p), cover: coverAsset(p, kind), coverBackground: p.bg,
	readingMinutes: p.min, publishedAt: `${p.d}T08:00:00Z`, author: author(p), isFeatured: p.id === 1, tags: [],
});

// ───────────────────────────── router ─────────────────────────────
const routes = [];
const route = (method, path, handler) => {
	const keys = [];
	const re = new RegExp("^" + path.replace(/:([a-zA-Z]+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$");
	routes.push({ method, re, keys, handler });
};

// config & home
route("GET", "/config", () => siteConfig());
route("GET", "/home", (ctx) => {
	const showcase = getP(1);
	return {
		hero: {
			eyebrow: "امضای کیوا: عکس قبل از ارسال", title: "هرچی ببینی، همون می‌رسه.",
			text: "قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس و ویدیو می‌گیریم و توی روبیکا، تلگرام یا بله برات می‌فرستیم. بدون غافلگیری.",
			primaryCta: { label: "مشاهده محصولات", url: "/products" }, secondaryCta: { label: "چطور کار می‌کنیم؟", url: "#how" },
			showcaseProduct: summary(showcase, ctx, "lilac"), showcaseMessenger: "TELEGRAM",
		},
		features: [
			{ icon: "camera", title: "عکس قبل از ارسال", subtitle: "کیف خودت رو قبل از ارسال ببین" },
			{ icon: "timer", title: "رزرو ۴ روزه", subtitle: "چند خرید، یک هزینه ارسال" },
			{ icon: "truck", title: "ارسال سریع", subtitle: "تیپاکس یا پست، به انتخاب خودت" },
			{ icon: "refresh", title: "۷ روز ضمانت بازگشت", subtitle: "اگه همونی نبود که دیدی" },
		],
		categories: D.CATEGORIES.map(categoryView),
		newArrivals: [...D.PRODUCTS].filter((p) => p.isNew || p.age < 20).sort((a, b) => a.age - b.age).slice(0, 8).map((p) => summary(p, ctx)),
		promos: [
			{ id: 1, placement: "HOME_PROMO", theme: "CREAM", tag: { label: "رزرو ۴ روزه", icon: "timer" }, title: "الان بخر،\nهمه رو یکجا تحویل بگیر", text: "پول کیف رو بده و تا ۴ روز رزروش کن؛ هر خرید دیگه‌ای هم داشتی، همه با یک هزینه ارسال می‌رسه.", cta: { label: "بیشتر بدونم", url: "/faq#reserve" }, image: { id: "bn1", type: "IMAGE", url: "https://images.unsplash.com/photo-1681747685985-a401c271156c?auto=format&fit=crop&w=800&q=80", alt: "کیف صورتی روی سنگ مرمر" }, overlay: { highlight: "4", title: "روز رزرو", subtitle: "یک هزینه ارسال", channel: null }, sortOrder: 1 },
			{ id: 2, placement: "HOME_PROMO", theme: "PURPLE", tag: { label: "امضای کیوا", icon: "camera" }, title: "کیف خودت رو\nقبل از ارسال ببین", text: "پیام‌رسانت رو انتخاب کن؛ عکس و ویدیوی کیفی که برات بسته‌بندی می‌کنیم همون‌جا و توی حسابت می‌رسه.", cta: { label: "چطوری؟", url: "#how" }, image: { id: "bn2", type: "IMAGE", url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80", alt: "کیف چرمی سبزآبی از نمای بالا" }, overlay: { highlight: null, title: "عکس کیف شما", subtitle: "در بله ارسال شد", channel: "BALE" }, sortOrder: 2 },
		],
		sale: campaign(ctx),
		testimonials: { summary: satisfaction(), items: testimonials(), meta: pageMeta(1, 8, 8) },
		howItWorks: [
			{ step: 1, title: "عکس و ویدیوی واقعی محصول", text: "هر کیف با عکس و ویدیوی واقعی خودش توی سایته؛ بدون فیلتر و بدون ادیت اغراق‌آمیز.", isSignature: false },
			{ step: 2, title: "عکس کیف خودت، قبل از ارسال", text: "قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس یا ویدیو می‌گیریم و توی روبیکا، تلگرام یا بله برات می‌فرستیم.", isSignature: true },
			{ step: 3, title: "تحویل، همونی که دیدی", text: "کیف با بسته‌بندی کیوا به دستت می‌رسه. عکسش هم برای همیشه توی جزئیات سفارشت می‌مونه.", isSignature: false },
		],
	};
});
route("GET", "/campaigns/active", (ctx) => campaign(ctx));
route("GET", "/testimonials", (ctx) => ({ summary: satisfaction(), ...paginate(testimonials(), ctx.query, 20) }));
route("GET", "/site/stats", () => ({ happyCustomers: 12000, preShipmentPhotos: 48000, photoMatchSatisfactionPercent: 98, productModels: 60, satisfaction: satisfaction() }));
route("GET", "/geo/provinces", (ctx) => D.PROVINCES.map((p) => (ctx.query.includeCities === "false" ? { id: p.id, name: p.name } : p)));
route("GET", "/geo/provinces/:id/cities", (ctx) => (D.PROVINCES.find((p) => p.id === Number(ctx.params.id)) || fail(404, "NOT_FOUND", "استان پیدا نشد.")).cities);

// content
route("GET", "/faq", (ctx) => {
	const q = ctx.query.q ? normQ(ctx.query.q) : "";
	const hl = (s) => (q ? esc(s).split(esc(q)).join(`<mark>${esc(q)}</mark>`) : null);
	let total = 0;
	const groups = D.FAQ_GROUPS.map((g, gi) => {
		const questions = g.q.filter(([a, b]) => !q || (a + b).includes(q)).map(([question, answer], i) => ({ id: gi * 10 + i + 1, question, answer: esc(answer), questionHighlighted: hl(question), answerHighlighted: hl(answer), sortOrder: i }));
		total += questions.length;
		return { id: g.id, name: g.name, icon: g.icon, isSignature: !!g.isSignature, sortOrder: gi, questions };
	}).filter((g) => g.questions.length);
	return { groups, totalMatches: total, emptyMessage: total ? null : "سوالی با این کلمه پیدا نکردیم؛ از پشتیبانی بپرس" };
});
route("GET", "/contact/topics", () => D.CONTACT_TOPICS);
// static CMS pages (`/pages/{slug}` — [پیشنهادی]); `termsUrl` of checkout points here
const STATIC_PAGES = {
	terms: {
		title: "قوانین و حریم خصوصی",
		updatedAt: "2026-09-20T08:00:00Z",
		description: "شرایط خرید از کیوا، ارسال، رزرو ۴ روزه، بازگشت کالا و این‌که با اطلاعاتت چه می‌کنیم.",
		content: [
			"<p>با ثبت سفارش در کیوا این شرایط رو می‌پذیری. سعی کردیم کوتاه و روشن بنویسیمشون؛ اگه جایی سؤال داشتی، پشتیبانی همیشه جوابگوست.</p>",
			"<h2>سفارش و پرداخت</h2>",
			"<ul><li>قیمت‌ها به <b>تومان</b> و شامل مالیات بر ارزش افزوده‌اند.</li><li>سفارش بعد از پرداخت موفق ثبت می‌شه؛ پرداخت ناتمام تا ۱۵ دقیقه نگه داشته می‌شه و بعد منقضی می‌شه.</li><li>اگه مبلغی کم شد ولی سفارش ثبت نشد، حداکثر تا ۷۲ ساعت به کارتت برمی‌گرده.</li></ul>",
			"<h2>عکس قبل از ارسال</h2>",
			"<p>قبل از بسته‌بندی، عکس و ویدیوی <b>همون کیفی که برات می‌فرستیم</b> رو توی پیام‌رسانی که انتخاب کردی و توی حسابت می‌فرستیم. تا وقتی تأیید نکنی یا مهلت پاسخ تموم نشه، ارسال نمی‌شه.</p>",
			"<h2>رزرو ۴ روزه</h2>",
			"<p>رزرو اختیاریه: کیف پرداخت‌شده تا ۴ روز پیش ما می‌مونه و خریدهای بعدیت به همون آدرس با <b>یک هزینه ارسال</b> کنارش قرار می‌گیرن.</p>",
			"<h2>بازگشت کالا</h2>",
			"<ol><li>تا ۷ روز بعد از تحویل می‌تونی درخواست مرجوعی ثبت کنی.</li><li>کیف باید سالم، استفاده‌نشده و با برچسب و بسته‌بندی اصلی باشه.</li><li>اگه کیف با عکسی که دیدی فرق داشت یا آسیب دیده بود، هزینه‌ی ارسال برگشت با کیواست.</li></ol>",
			"<h2>حریم خصوصی</h2>",
			"<p>شماره موبایل، نشانی و اطلاعات سفارش فقط برای پردازش و ارسال سفارش و پشتیبانی استفاده می‌شن و <b>به هیچ شخص ثالثی فروخته نمی‌شن</b>. اطلاعات پرداخت مستقیم در درگاه بانک وارد می‌شه و کیوا اون‌ها رو نمی‌بینه.</p>",
			"<p>پیامک‌های تبلیغاتی فقط با اجازه‌ی خودت فرستاده می‌شن و از <a href=\"/account/profile\">اطلاعات شخصی</a> حسابت قابل خاموش کردنه.</p>",
			"<blockquote>هرچی ببینی، همون می‌رسه.</blockquote>",
		].join(""),
	},
};
route("GET", "/pages/:slug", (ctx) => {
	const page = STATIC_PAGES[ctx.params.slug] || fail(404, "PAGE_NOT_FOUND", "این صفحه پیدا نشد.");
	return {
		slug: ctx.params.slug, title: page.title, content: page.content, updatedAt: page.updatedAt,
		seo: { title: `${page.title} | کیوا`, description: page.description, canonicalUrl: `https://kiva.ir/pages/${ctx.params.slug}` },
	};
});

route("POST", "/contact/messages", (ctx) => {
	const b = ctx.body || {};
	const errors = [];
	if (!D.CONTACT_TOPICS.some((t) => t.value === b.topic)) errors.push({ field: "topic", code: "REQUIRED", message: "موضوع رو انتخاب کن" });
	if (!b.fullName || String(b.fullName).trim().length < 3) errors.push({ field: "fullName", code: "MIN_LENGTH", message: "نامت رو وارد کن" });
	if (!validPhone(b.phone)) errors.push({ field: "phone", code: "PHONE_INVALID", message: "موبایل ۱۱ رقمی وارد کن" });
	if (!b.message || String(b.message).trim().length < 10) errors.push({ field: "message", code: "MIN_LENGTH", message: "حداقل ۱۰ حرف بنویس" });
	if (errors.length) validation(errors);
	ctx.status = 201;
	return { ticketCode: `CT-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: iso(Date.now()), message: "پیامت رسید! به زودی از طریق پیامک باهات تماس می‌گیریم." };
});
route("POST", "/newsletter/subscriptions", (ctx) => {
	if (!/^\S+@\S+\.\S+$/.test(String(ctx.body?.email || ""))) validation([{ field: "email", code: "EMAIL_INVALID", message: "یه ایمیل درست وارد کن" }]);
	ctx.status = 201;
	return { message: "عضو خبرنامه کیوا شدی!" };
});

// auth
route("POST", "/auth/otp/send", (ctx) => {
	const phone = toEn(ctx.body?.phone).replace(/\D/g, "");
	if (!validPhone(phone)) validation([{ field: "phone", code: "PHONE_INVALID", message: "شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه" }]);
	return { phone, codeLength: 5, expiresInSeconds: 300, resendAvailableInSeconds: 120 };
});
route("POST", "/auth/otp/verify", (ctx) => {
	const phone = toEn(ctx.body?.phone).replace(/\D/g, ""), code = toEn(ctx.body?.code);
	if (!validPhone(phone)) validation([{ field: "phone", code: "PHONE_INVALID", message: "شماره موبایل معتبر نیست" }]);
	if (!/^\d{5}$/.test(code)) validation([{ field: "code", code: "PATTERN", message: "کد ۵ رقمی رو کامل وارد کن" }]);
	if (code === "00000") fail(422, "OTP_INVALID", "کد واردشده درست نیست.", { meta: { attemptsLeft: 2 } });
	const isNewUser = !users.has(phone);
	const u = getUserByPhone(phone, true);
	const guest = ctx.body?.guestCartToken && carts.get(ctx.body.guestCartToken);
	if (guest && guest.id !== u.cartId) {
		const mine = carts.get(u.cartId) || newCart();
		guest.items.forEach((i) => { try { addToCart(mine, i.variantId, i.qty); } catch { /* skip unavailable */ } });
		if (guest.code && !mine.code) mine.code = guest.code;
		carts.delete(guest.id); u.cartId = mine.id; carts.set(mine.id, mine);
	}
	ctx.user = u;
	return { ...issueTokens(u), isNewUser, user: userView(u), cart: cartView(carts.get(u.cartId), ctx) };
});
route("POST", "/auth/refresh", (ctx) => {
	const phone = refresh.get(ctx.body?.refreshToken);
	if (!phone) fail(401, "REFRESH_TOKEN_INVALID", "نشستت تموم شده؛ دوباره وارد شو.");
	refresh.delete(ctx.body.refreshToken);
	return issueTokens(users.get(phone));
});
route("POST", "/auth/logout", (ctx) => {
	needUser(ctx);
	refresh.delete(ctx.body?.refreshToken);
	access.delete(ctx.token);
	ctx.status = 204;
});
// test aid (not in the spec): expire every access token now, to watch the FE rotate them (e.g. with two tabs open)
route("POST", "/__mock/expire-access-tokens", (ctx) => {
	for (const at of accessExpiry.keys()) accessExpiry.set(at, 0);
	ctx.status = 204;
});

// catalogue
route("GET", "/categories", () => D.CATEGORIES.map(categoryView));
route("GET", "/categories/:slug", (ctx) => categoryView(D.CATEGORIES.find((c) => c.slug === ctx.params.slug) || fail(404, "NOT_FOUND", "دسته‌بندی پیدا نشد.")));
route("GET", "/colors", () => D.COLORS.map((c) => ({ ...c, productCount: D.PRODUCTS.filter((p) => p.colors.includes(c.key)).length })));
route("GET", "/products", (ctx) => {
	const q = ctx.query;
	const sort = SORTS[q.sort] ? q.sort : "newest";
	const { f, fn } = productFilter(q);
	let list = D.PRODUCTS.filter(fn).sort(SORTS[sort]);
	if (!sort.startsWith("price")) list.sort((a, b) => (a.stock === 0) - (b.stock === 0));
	if (f.ids.length) list = f.ids.map((id) => list.find((p) => p.id === id)).filter(Boolean);
	const { items, meta } = paginate(list, q, 24);
	const one = f.cats.length === 1 ? D.CATEGORIES.find((c) => c.slug === f.cats[0]) : null;
	const applied = [];
	if (f.q) applied.push({ key: "q", value: f.q, label: `جستجو: «${f.q}»`, swatchHex: null });
	f.cats.forEach((s) => { const c = D.CATEGORIES.find((x) => x.slug === s); if (c) applied.push({ key: "category", value: s, label: c.name, swatchHex: null }); });
	f.colors.forEach((k) => { const c = D.COLOR_BY_KEY[k]; if (c) applied.push({ key: "color", value: k, label: c.name, swatchHex: c.hex }); });
	if ((f.min != null && f.min > PMIN) || (f.max != null && f.max < PMAX)) applied.push({ key: "price", value: null, label: `${price(f.min ?? PMIN)} تا ${price(f.max ?? PMAX)} تومان`, swatchHex: null });
	if (f.onSale) applied.push({ key: "onSale", value: null, label: "تخفیف‌خورده", swatchHex: null });
	if (f.inStock) applied.push({ key: "inStock", value: null, label: "موجود", swatchHex: null });
	const title = one ? one.name : f.onSale && !f.cats.length ? "تخفیف‌خورده‌ها" : "فروشگاه کیوا";
	return {
		items: items.map((p) => summary(p, ctx, p.colors.find((c) => f.colors.includes(c)))), meta,
		title, subtitle: "همه‌ی کیف‌ها با عکس و ویدیوی واقعی؛ رنگت رو انتخاب کن تا عکس همون رنگ رو ببینی.",
		breadcrumbs: [{ label: "خانه", url: "/" }, { label: one ? one.name : "فروشگاه", url: null }],
		appliedFilters: applied, sort, facets: bool(q.includeFacets) ? facets(q) : null,
	};
});
route("GET", "/products/facets", (ctx) => facets(ctx.query));
route("GET", "/products/:idOrSlug", (ctx) => detail(findProduct(ctx.params.idOrSlug), ctx, ctx.query.color));
route("GET", "/products/:id/related", (ctx) => {
	const p = findProduct(ctx.params.id);
	const limit = Math.min(24, Number(ctx.query.limit) || 8);
	return D.PRODUCTS.filter((x) => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat) || b.sold - a.sold).slice(0, limit).map((x) => summary(x, ctx));
});
route("POST", "/products/:id/stock-alerts", (ctx) => {
	const p = findProduct(ctx.params.id);
	const phone = ctx.user?.phone || toEn(ctx.body?.phone).replace(/\D/g, "");
	if (!validPhone(phone)) validation([{ field: "phone", code: "PHONE_INVALID", message: "موبایل معتبر وارد کن" }]);
	if (p.stock) fail(422, "PRODUCT_IN_STOCK", "این محصول همین الان موجوده!");
	if (stockAlerts.some((a) => a.phone === phone && a.productId === p.id && a.status === "ACTIVE")) fail(409, "STOCK_ALERT_EXISTS", "قبلاً ثبت کردی؛ هر وقت موجود شد بهت پیامک می‌دیم.");
	const a = { id: ++ALERT_SEQ, phone, productId: p.id, variantId: ctx.body?.variantId ?? null, status: "ACTIVE", createdAt: Date.now(), notifiedAt: null };
	stockAlerts.push(a);
	ctx.status = 201;
	return alertView(a);
});
// a subscription → `StockAlert` (colour from the variant; `null` = any colour)
function alertView(a) {
	const p = getP(a.productId);
	const k = a.variantId ? variantById(a.variantId)?.k ?? null : null;
	return {
		id: a.id, product: { id: p.id, slug: p.slug, sku: `KV-${1000 + p.id}`, name: p.n, imageUrl: img(p, k || p.colors[0]), colorKey: k },
		variantId: a.variantId, color: k ? color(k) : null, channel: "SMS", phoneMasked: `${a.phone.slice(0, 4)}***${a.phone.slice(-4)}`,
		status: a.status, createdAt: iso(a.createdAt), notifiedAt: a.notifiedAt ? iso(a.notifiedAt) : null,
		message: a.status === "NOTIFIED" ? "موجود شد و پیامکش رو برات فرستادیم" : "هر وقت موجود شد، بهت پیامک می‌دیم",
	};
}
route("GET", "/me/stock-alerts", (ctx) => {
	const u = needUser(ctx);
	return stockAlerts.filter((a) => a.phone === u.phone && a.status !== "CANCELLED").sort((a, b) => b.createdAt - a.createdAt).map(alertView);
});
route("DELETE", "/me/stock-alerts/:id", (ctx) => {
	const u = needUser(ctx);
	const a = stockAlerts.find((x) => x.id === Number(ctx.params.id) && x.phone === u.phone && x.status !== "CANCELLED") || fail(404, "STOCK_ALERT_NOT_FOUND", "این اطلاع‌رسانی پیدا نشد.");
	a.status = "CANCELLED";
	ctx.status = 204;
});
route("PUT", "/reviews/:id/helpful", (ctx) => {
	const u = needUser(ctx);
	const id = Number(ctx.params.id);
	const p = getP(Math.floor(id / 100));
	const review = p && reviewsOf(p).find((r) => r.id === id);
	if (!review) fail(404, "REVIEW_NOT_FOUND", "این نظر پیدا نشد.");
	if (typeof ctx.body?.helpful !== "boolean") validation([{ field: "helpful", code: "REQUIRED", message: "رأیت رو انتخاب کن" }]);
	if (!helpfulVotes.has(id)) helpfulVotes.set(id, new Map());
	helpfulVotes.get(id).set(u.phone, ctx.body.helpful);
	const now = reviewsOf(p, ctx).find((r) => r.id === id);
	return { helpfulCount: now.helpfulCount, myVote: now.myHelpfulVote };
});
route("GET", "/products/:id/inquiry", (ctx) => {
	const p = findProduct(ctx.params.id);
	const k = p.colors.includes(ctx.query.color) ? ctx.query.color : p.colors[0];
	const text = `سلام، درباره «${p.n}» رنگ ${D.COLOR_BY_KEY[k].name} (کد KV-${1000 + p.id}) سؤال دارم. می‌شه عکس/ویدیوی بیشتری بفرستید؟`;
	return {
		productCode: `KV-${1000 + p.id}`, productName: p.n, colorName: D.COLOR_BY_KEY[k].name, prefilledText: text,
		channels: D.SOCIAL.filter((s) => s.channel !== "INSTAGRAM").sort((a, b) => ["RUBIKA", "TELEGRAM", "BALE"].indexOf(a.channel) - ["RUBIKA", "TELEGRAM", "BALE"].indexOf(b.channel))
			.map((s) => ({ channel: s.channel, name: s.name, url: `${s.url}?text=${encodeURIComponent(text)}`, handle: s.handle, responseHours: "پاسخگویی ۹ تا ۲۱" })),
	};
});
route("GET", "/products/:id/reviews", (ctx) => {
	const p = findProduct(ctx.params.id);
	const mine = ctx.user ? pendingReviews.filter((r) => r.productId === p.id && r.phone === ctx.user.phone).map((r) => ({ ...r.view, isMine: true })) : [];
	let list = reviewsOf(p, ctx);
	if (ctx.query.rating) list = list.filter((r) => r.rating === Number(ctx.query.rating));
	return { summary: ratingSummary(p), ...paginate([...mine, ...list], ctx.query, 20) };
});
route("POST", "/products/:id/reviews", (ctx) => {
	const u = needUser(ctx);
	const p = findProduct(ctx.params.id);
	const b = ctx.body || {};
	const errors = [];
	if (!b.text || String(b.text).trim().length < 10) errors.push({ field: "text", code: "MIN_LENGTH", message: "حداقل ۱۰ حرف بنویس" });
	const contact = toEn(b.contact || "").trim();
	if (contact && !validPhone(contact) && !/^\S+@\S+\.\S+$/.test(contact)) errors.push({ field: "contact", code: "INVALID", message: "شماره موبایل یا ایمیل معتبر وارد کن" });
	if (errors.length) validation(errors);
	if (pendingReviews.some((r) => r.productId === p.id && r.phone === u.phone)) fail(409, "REVIEW_ALREADY_EXISTS", "برای این محصول یه نظر در انتظار تأیید داری.");
	const name = String(b.authorName || "").trim() || "کاربر کیوا";
	const view = { id: ++REVIEW_SEQ, productId: p.id, authorName: name, authorInitial: name[0], rating: Number(b.rating) || 5, title: null, text: String(b.text).trim(), createdAt: iso(Date.now()), status: "PENDING", statusLabel: "در انتظار تأیید", isVerifiedBuyer: false, purchasedColor: null, reply: null, helpfulCount: 0, myHelpfulVote: null, media: [], isMine: true };
	pendingReviews.push({ productId: p.id, phone: u.phone, view });
	u.reviews.unshift({ id: view.id, productId: p.id, rating: view.rating, text: view.text, createdAt: Date.now(), status: "PENDING", reply: null });
	ctx.status = 201;
	return view;
});

// search
route("GET", "/search/suggest", (ctx) => {
	const q = normQ(ctx.query.q || "");
	if (!q) validation([{ field: "q", code: "REQUIRED", message: "عبارت جستجو رو وارد کن" }]);
	const words = q.split(/\s+/).filter(Boolean);
	const hl = (s) => { let out = esc(s); words.forEach((w) => { out = out.split(esc(w)).join(`<mark>${esc(w)}</mark>`); }); return out; };
	const found = D.PRODUCTS.filter((p) => matchQ(p, q));
	const limit = Math.min(20, Number(ctx.query.limit) || 8);
	return {
		query: ctx.query.q, normalizedQuery: q,
		products: found.slice(0, limit).map((p) => {
			const k = p.colors.find((c) => q.includes(D.COLOR_BY_KEY[c].name)) || null;
			return { id: p.id, slug: p.slug, name: p.n, nameHighlighted: hl(p.n), categoryName: catOf(p).name, price: priceInfo(p), matchedColorKey: k, imageUrl: img(p, k || p.colors[0]), url: `/product/${p.slug}${k ? `?color=${k}` : ""}` };
		}),
		categories: D.CATEGORIES.filter((c) => c.name.includes(q)).map(catRef),
		colors: D.COLORS.filter((c) => q.includes(c.name)),
		totalProducts: found.length, seeAllUrl: `/products?q=${encodeURIComponent(q)}`,
	};
});
route("GET", "/search/hints", () => ({
	categories: D.CATEGORIES.slice(0, 6).map(catRef),
	colors: ["black", "lilac", "cream", "caramel", "red", "olive", "pink"].map(color),
	popularQueries: ["کیف مجلسی", "کوله دانشگاه", "کراس‌بادی مشکی"],
}));

// cart
route("GET", "/cart", (ctx) => cartView(resolveCart(ctx), ctx));
route("DELETE", "/cart", (ctx) => { const c = resolveCart(ctx); c.items = []; c.code = null; c.reserve = false; return cartView(c, ctx); });
route("POST", "/cart/items", (ctx) => {
	const c = resolveCart(ctx);
	const qty = Math.max(1, Math.min(20, Number(ctx.body?.quantity) || 1));
	const { line, v } = addToCart(c, ctx.body?.variantId, qty);
	return mutation(c, ctx, { affectedItemId: line.id, message: `${v.p.n} (${D.COLOR_BY_KEY[v.k].name}) به سبد اضافه شد` });
});
route("PATCH", "/cart/items/:itemId", (ctx) => {
	const c = resolveCart(ctx);
	const line = c.items.find((i) => i.id === ctx.params.itemId) || fail(404, "CART_ITEM_NOT_FOUND", "این کالا توی سبدت نیست.");
	if (ctx.body?.variantId) { const v = variantById(ctx.body.variantId) || fail(404, "VARIANT_NOT_FOUND", "این رنگ پیدا نشد."); line.variantId = variantId(v.p, v.k); }
	if (ctx.body?.quantity != null) {
		const { p } = variantById(line.variantId);
		const q = Number(ctx.body.quantity);
		if (q > p.stock) fail(422, "QUANTITY_EXCEEDS_STOCK", `حداکثر موجودی این کالا ${fa(p.stock)} عدده`, { meta: { availableQuantity: p.stock } });
		line.qty = Math.max(1, q);
	}
	return mutation(c, ctx, { affectedItemId: line.id });
});
route("DELETE", "/cart/items/:itemId", (ctx) => {
	const c = resolveCart(ctx);
	const line = c.items.find((i) => i.id === ctx.params.itemId) || fail(404, "CART_ITEM_NOT_FOUND", "این کالا توی سبدت نیست.");
	c.items = c.items.filter((i) => i !== line);
	const { p } = variantById(line.variantId);
	return mutation(c, ctx, { removedItem: { variantId: line.variantId, quantity: line.qty, name: p.n }, message: `${p.n} حذف شد` });
});
route("POST", "/cart/items/:itemId/move-to-wishlist", (ctx) => {
	const u = needUser(ctx);
	const c = resolveCart(ctx);
	const line = c.items.find((i) => i.id === ctx.params.itemId) || fail(404, "CART_ITEM_NOT_FOUND", "این کالا توی سبدت نیست.");
	const { p, k } = variantById(line.variantId);
	if (!u.wishlist.some((w) => w.productId === p.id)) u.wishlist.unshift({ productId: p.id, addedAt: Date.now(), colorKey: k, priceAtAdd: p.price });
	c.items = c.items.filter((i) => i !== line);
	return mutation(c, ctx, { message: `${p.n} به علاقه‌مندی‌ها منتقل شد` });
});
route("PUT", "/cart/shipping-method", (ctx) => {
	const m = ctx.body?.method;
	if (!D.SHIPPING[m]) fail(422, "SHIPPING_METHOD_UNAVAILABLE", "این روش ارسال فعلاً در دسترس نیست.");
	const c = resolveCart(ctx); c.shippingMethod = m; return cartView(c, ctx);
});
route("PUT", "/cart/reservation", (ctx) => {
	const c = resolveCart(ctx);
	const enabled = !!ctx.body?.enabled;
	const r = reservationView(c, ctx);
	// turning it off is always allowed
	if (enabled && !r.available) fail(422, "RESERVATION_UNAVAILABLE", RESERVATION_MSG[r.unavailableReason], { meta: { reason: r.unavailableReason } });
	c.reserve = enabled;
	return cartView(c, ctx);
});
route("POST", "/cart/discount-code", (ctx) => {
	const code = String(ctx.body?.code || "").toUpperCase().trim();
	if (code.length < 2) validation([{ field: "code", code: "REQUIRED", message: "کد تخفیف رو وارد کن" }]);
	const c = resolveCart(ctx);
	const sub = cartView(c, ctx).totals.subtotal;
	const d = codeDiscount(code, sub);
	if (!d.ok) fail(422, d.code, d.msg, d.meta ? { meta: d.meta } : {});
	c.code = code;
	return cartView(c, ctx);
});
route("DELETE", "/cart/discount-code", (ctx) => { const c = resolveCart(ctx); c.code = null; return cartView(c, ctx); });
route("POST", "/cart/merge", (ctx) => { needUser(ctx); return cartView(resolveCart(ctx), ctx); });

// checkout & payment
const checkoutContext = (ctx) => {
	const u = needUser(ctx);
	const c = resolveCart(ctx);
	if (!c.items.length) fail(422, "CART_EMPTY", "سبد خریدت خالیه.");
	const def = u.addresses.find((a) => a.isDefault) || u.addresses[0];
	const addressId = ctx.query.addressId ? Number(ctx.query.addressId) : def ? def.id : null;
	const cart = cartView(c, ctx, { addressId });
	return {
		cart, addresses: u.addresses.map(addressView), selectedAddressId: def ? def.id : null,
		messengers: D.MESSENGERS, selectedMessenger: u.defaultMessenger, messengerPhone: u.defaultMessengerPhone || u.phone,
		shippingOptions: cart.shippingOptions, reservation: cart.reservation, consolidation: cart.consolidation,
		paymentGateways: D.GATEWAYS, giftWrap: { available: false, price: 0 }, termsUrl: "/pages/terms",
	};
};
route("GET", "/checkout", (ctx) => checkoutContext(ctx));
function validateAddressInput(a, prefix = "") {
	const errors = [];
	const prov = D.PROVINCES.find((p) => p.id === Number(a?.provinceId));
	if (!prov) errors.push({ field: `${prefix}provinceId`, code: "REQUIRED", message: "استان رو انتخاب کن" });
	else if (!prov.cities.some((c) => c.id === Number(a.cityId))) errors.push({ field: `${prefix}cityId`, code: "REQUIRED", message: "شهر رو انتخاب کن" });
	if (!a?.addressLine || String(a.addressLine).trim().length < 10) errors.push({ field: `${prefix}addressLine`, code: "MIN_LENGTH", message: "آدرس کامل رو بنویس" });
	if (!/^\d{10}$/.test(toEn(a?.postalCode))) errors.push({ field: `${prefix}postalCode`, code: "PATTERN", message: "کد پستی باید ۱۰ رقم باشه" });
	if (!a?.recipientName || String(a.recipientName).trim().length < 3) errors.push({ field: `${prefix}recipientName`, code: "MIN_LENGTH", message: "نام گیرنده رو وارد کن" });
	if (!validPhone(a?.recipientPhone)) errors.push({ field: `${prefix}recipientPhone`, code: "PHONE_INVALID", message: "موبایل معتبر وارد کن" });
	return errors;
}
const toAddress = (a, id) => ({ id, title: a.title ?? null, provinceId: Number(a.provinceId), cityId: Number(a.cityId), addressLine: String(a.addressLine).trim(), postalCode: toEn(a.postalCode), recipientName: String(a.recipientName).trim(), recipientPhone: toEn(a.recipientPhone), isSelfRecipient: !!a.isSelfRecipient, isDefault: false, createdAt: iso(Date.now()) });
route("POST", "/orders", (ctx) => {
	const u = needUser(ctx);
	const key = ctx.req.headers["idempotency-key"];
	if (key && idempotency.has(key)) return idempotency.get(key);
	const b = ctx.body || {};
	const c = resolveCart(ctx);
	if (!c.items.length) fail(422, "CART_EMPTY", "سبد خریدت خالیه.");
	let address;
	if (b.newAddress) {
		const errors = validateAddressInput(b.newAddress, "newAddress.");
		if (errors.length) validation(errors);
		address = toAddress(b.newAddress, ADDR_SEQ + 1);
	} else {
		address = u.addresses.find((a) => a.id === Number(b.addressId)) || fail(422, "ADDRESS_NOT_FOUND", "آدرس انتخاب‌شده پیدا نشد.");
	}
	const m = b.preShipmentMessenger || {};
	if (!["RUBIKA", "TELEGRAM", "BALE"].includes(m.channel)) fail(422, "MESSENGER_REQUIRED", "یکی از پیام‌رسان‌ها رو انتخاب کن تا عکس کیفت رو برات بفرستیم.");
	if (!validPhone(m.phone)) fail(422, "MESSENGER_PHONE_INVALID", "شماره موبایل معتبر وارد کن");
	if (!D.SHIPPING[b.shippingMethod]) fail(422, "SHIPPING_METHOD_UNAVAILABLE", "این روش ارسال فعلاً در دسترس نیست.");
	if (!b.acceptTerms) fail(422, "TERMS_NOT_ACCEPTED", "برای ثبت سفارش باید قوانین کیوا رو بپذیری.");
	const resv = reservationView(c, ctx);
	if (b.reserve === true && !resv.available) fail(422, "RESERVATION_UNAVAILABLE", RESERVATION_MSG[resv.unavailableReason], { meta: { reason: resv.unavailableReason } });
	c.shippingMethod = b.shippingMethod;
	if (b.reserve != null && resv.available) c.reserve = !!b.reserve;
	// joining an active reservation is decided now, for the address the order goes to
	const addressId = b.newAddress ? (b.saveNewAddress !== false ? address.id : null) : address.id;
	const view = cartView(c, ctx, { addressId });
	const group = view.consolidation ? activeGroup(u) : null;
	if (b.expectedPayable != null && Number(b.expectedPayable) !== view.totals.payable) fail(409, "PRICE_CHANGED", `مبلغ سفارش به ${price(view.totals.payable)} تومان تغییر کرد.`, { meta: { payable: view.totals.payable } });
	// every check passed — only now does anything stick (a real backend does this in one transaction)
	if (b.newAddress && b.saveNewAddress !== false) { ADDR_SEQ++; if (!u.addresses.length) address.isDefault = true; u.addresses.push(address); }
	if (m.saveAsDefault !== false) { u.defaultMessenger = m.channel; u.defaultMessengerPhone = toEn(m.phone); }
	const order = {
		code: `KV-${String(Date.now() % 1000000).padStart(6, "0")}`, placedAt: Date.now(), status: 0, reserve: !!group || c.reserve,
		items: c.items.map((i) => { const { p, k } = variantById(i.variantId); return { id: p.id, color: k, qty: i.qty }; }),
		messenger: m.channel, messengerPhone: toEn(m.phone), shippingMethod: view.shippingMethod, addressId, holdUntil: Date.now() + HOLD_MS,
		group: null, returns: [], feedback: null, feedbackDeadline: null,
		totals: { full: view.totals.itemsCompareAtTotal, prodOff: view.totals.productDiscount, code: view.totals.codeDiscount, ship: view.totals.shippingCost, total: view.totals.payable },
		trackingCode: "", mediaViews: [], address: addressSnapshot(address), gateway: b.paymentGateway || "ZARINPAL", note: m.note || null,
		// unpaid until the (fake) bank says so; a fully discounted order is paid right away
		paid: view.totals.payable === 0,
	};
	u.orders.unshift(order);
	// a joining order belongs to the group right away (free shipping is kept even if the deadline passes before payment)
	if (group) { order.group = group; group.members.push(order); } else if (order.paid && order.reserve) joinOrStartGroup(u, order);
	c.items = []; c.code = null; c.reserve = false;
	ctx.status = 201;
	const res = { order: orderSummary(order), payment: order.paid ? null : startPayment(order, u, order.gateway) };
	if (key) idempotency.set(key, res);
	return res;
});
/** A new PENDING transaction that leaves for the fake bank page (`/mock-gateway/:id`). */
function startPayment(o, u, gateway) {
	const paymentId = rid("pay");
	payments.set(paymentId, { orderCode: o.code, phone: u.phone, gateway, amount: o.totals.total, status: "PENDING", paidAt: null });
	return { paymentId, gateway, amount: o.totals.total, redirect: { url: `${ORIGIN}/mock-gateway/${paymentId}`, method: "GET", fields: {} }, expiresAt: iso(Date.now() + 15 * 60e3) };
}
const myPayment = (ctx) => {
	const u = needUser(ctx);
	const pay = payments.get(ctx.params.paymentId);
	if (!pay || pay.phone !== u.phone) fail(404, "PAYMENT_NOT_FOUND", "این پرداخت پیدا نشد.");
	return { u, pay, o: u.orders.find((x) => x.code === pay.orderCode) };
};
route("POST", "/payments/:paymentId/retry", (ctx) => {
	const { u, pay, o } = myPayment(ctx);
	if (o.paid !== false) fail(422, "ORDER_ALREADY_PAID", "این سفارش قبلاً پرداخت شده.");
	if (isExpired(o) || o.cancelledAt) fail(422, "PAYMENT_EXPIRED", "مهلت پرداخت این سفارش تموم شده و کیف‌ها به فروشگاه برگشتن.");
	const key = ctx.req.headers["idempotency-key"];
	if (key && idempotency.has(key)) return idempotency.get(key);
	ctx.status = 201;
	const res = startPayment(o, u, ctx.body?.gateway || pay.gateway);
	if (key) idempotency.set(key, res);
	return res;
});
route("GET", "/payments/:paymentId", (ctx) => {
	const { pay, o } = myPayment(ctx);
	const ok = pay.status === "SUCCEEDED";
	return {
		paymentId: ctx.params.paymentId, status: pay.status, amount: pay.amount, gateway: pay.gateway,
		referenceId: ok ? "201843917" : null, cardMask: ok ? "6037-99**-****-1234" : null, paidAt: ok ? iso(pay.paidAt) : null,
		failureReason: pay.status === "CANCELLED" ? "تراکنش توسط کاربر لغو شد" : null, canRetry: !ok && o.paid === false,
		order: { code: o.code, status: statusOf(o).status, reserved: !!o.reserve, consolidatedInto: o.group && o.group.rootCode !== o.code ? o.group.rootCode : null },
		nextSteps: [
			o.group && o.group.rootCode !== o.code
				? `این خرید به سفارش رزروی ${o.group.rootCode} اضافه شد و با همون، بدون هزینه ارسال فرستاده می‌شه.`
				: o.reserve ? "سفارشت تا ۴ روز رزرو می‌مونه؛ هر خریدی داشتی به همین سفارش اضافه می‌شه." : "سفارشت در حال آماده‌سازیه.",
			`عکس و ویدیوی کیفت رو قبل از ارسال توی ${MSGR_NAME[o.messenger]} برات می‌فرستیم.`,
			`بعد از تحویل به ${shipName(o.shippingMethod)}، کد رهگیری توی حسابت قرار می‌گیره.`,
		],
	};
});

// tracking (public)
function demoTracking(code) {
	const n = Number(code.replace(/\D/g, "")) || 7, st = n % 4;
	const p = D.PRODUCTS[n % D.PRODUCTS.length], ship = n % 2 ? "TIPAX" : "POST", msgr = ["RUBIKA", "TELEGRAM", "BALE"][n % 3];
	return { code, placedAt: Date.now() - (st + 1) * DAY, status: st, reserve: false, items: [{ id: p.id, color: p.colors[0], qty: 1 }], messenger: msgr, shippingMethod: ship, trackingCode: st >= 2 ? (n % 2 ? "TPX" + String(n).padStart(7, "0") : String(1839206745 + n).padEnd(24, "0")) : "", mediaViews: st >= 1 ? [0, 3, 1, "v"] : [] };
}
route("POST", "/tracking/lookup", (ctx) => {
	const raw = toEn(ctx.body?.orderCode).trim().toUpperCase().replace(/^(KV)?-?/, "KV-");
	const phone = toEn(ctx.body?.phone).replace(/\D/g, "");
	const errors = [];
	if (!/^KV-\d{4,8}$/.test(raw)) errors.push({ field: "orderCode", code: "PATTERN", message: "شماره سفارش رو درست وارد کن" });
	if (!validPhone(phone)) errors.push({ field: "phone", code: "PHONE_INVALID", message: "موبایل ۱۱ رقمی وارد کن" });
	if (errors.length) validation(errors);
	const hit = findOrderByCode(raw);
	const o = hit && (hit.u.phone === phone || hit.o.address.recipientPhone === phone) ? hit.o : raw.endsWith("0000") ? null : demoTracking(raw);
	if (!o) fail(404, "TRACKING_NOT_FOUND", "سفارشی با این شماره و موبایل پیدا نکردیم.");
	const s = orderSummary({ address: {}, totals: { total: 0 }, ...o });
	const { p, k } = firstItem(o);
	return {
		code: o.code, placedAt: iso(o.placedAt), shippingMethod: s.shippingMethod, status: s.status, statusLabel: s.progress.steps[Math.min(o.status, 3)].label, statusTone: o.status === 3 ? "SUCCESS" : "DEFAULT",
		progress: s.progress, shipment: s.shipment,
		preShipmentMedia: o.mediaViews.length ? { channelName: MSGR_NAME[o.messenger], preview: o.mediaViews.slice(0, 4).map((m) => media(p, k, m === "v" ? 2 : m)), totalCount: o.mediaViews.length } : null,
		loginHint: "برای دیدن جزئیات کامل، آدرس و همه عکس‌ها وارد حساب کاربری شو.",
	};
});
const rnd = (s) => () => (s = (s * 9301 + 49297) % 233280) / 233280;
function dayShipments(t) {
	const [y, m, d] = tehranDate(t).split("-").map(Number);
	const r = rnd(y * 400 + (m - 1) * 31 + d);
	const isFriday = tehranWeekday(t) === "Fri";
	const n = isFriday ? 0 : 6 + Math.floor(r() * 9);
	return Array.from({ length: n }, (_, i) => {
		const tip = r() > 0.62, nm = D.DAILY.names[Math.floor(r() * D.DAILY.names.length)];
		const last = D.DAILY.last[Math.floor(r() * D.DAILY.last.length)], city = D.DAILY.cities[Math.floor(r() * D.DAILY.cities.length)];
		const ph = String(1000 + Math.floor(r() * 9000));
		const code = tip ? "TPX" + String(Math.floor(r() * 1e7)).padStart(7, "0") : Array.from({ length: 24 }, () => Math.floor(r() * 10)).join("");
		const carrier = tip ? "TIPAX" : "POST";
		return { id: d * 1000 + i, recipientMasked: `${nm[0]}*** ${last}***`, recipientInitial: nm[0], city, carrier, carrierName: shipName(carrier), phoneLast4: ph, phoneMasked: `09** *** ${ph}`, trackingCode: code, trackingUrl: D.SHIPPING[carrier].trackingUrl, shippedAt: iso(t), _name: nm };
	});
}
route("GET", "/tracking/daily/days", (ctx) => {
	const days = Math.min(30, Math.max(1, Number(ctx.query.days) || 10));
	return Array.from({ length: days }, (_, i) => {
		const t = Date.now() - i * DAY;
		return { date: tehranDate(t), label: i === 0 ? "امروز" : i === 1 ? "دیروز" : jdate(t, { weekday: "long" }), shipmentCount: dayShipments(t).length, isNonShippingDay: tehranWeekday(t) === "Fri" };
	});
});
route("GET", "/tracking/daily", (ctx) => {
	const date = ctx.query.date;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) validation([{ field: "date", code: "PATTERN", message: "تاریخ معتبر نیست" }]);
	const t = new Date(`${date}T12:00:00+03:30`).getTime();
	const q = toEn(ctx.query.q || "").trim();
	const all = dayShipments(t);
	// the full first name is only for matching — it never leaves the server
	const list = all.filter((x) => !q || x.phoneLast4.includes(q) || x._name.startsWith(q) || x.city.includes(q)).map((x) => { const rest = { ...x }; delete rest._name; return rest; });
	const friday = tehranWeekday(t) === "Fri";
	return {
		date, label: jdate(t, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), isNonShippingDay: friday,
		emptyMessage: friday && !q ? "جمعه‌ها ارسال نداریم" : list.length ? null : "موردی پیدا نشد. ۴ رقم آخر موبایلت رو دوباره چک کن.",
		...paginate(list, ctx.query, 100),
	};
});

// account
route("GET", "/me", (ctx) => userView(needUser(ctx)));
route("PATCH", "/me", (ctx) => {
	const u = needUser(ctx);
	const b = ctx.body || {};
	if (b.email && !/^\S+@\S+\.\S+$/.test(b.email)) validation([{ field: "email", code: "EMAIL_INVALID", message: "ایمیل معتبر نیست" }]);
	["firstName", "lastName", "email", "birthDate", "gender", "defaultMessenger", "defaultMessengerPhone", "marketingSmsOptIn"].forEach((k) => { if (k in b) u[k] = b[k] === "" ? null : b[k]; });
	return userView(u);
});
route("GET", "/me/dashboard", (ctx) => {
	const u = needUser(ctx);
	const g = activeGroup(u);
	return {
		greeting: `سلام ${u.firstName || "دوست عزیز"}`, user: userView(u),
		stats: { ordersTotal: u.orders.length, ordersActive: u.orders.filter((o) => bucketOf(o) === "current").length, mediaReceived: u.orders.reduce((s, o) => s + o.mediaViews.length, 0), wishlistCount: u.wishlist.length },
		navCounts: { orders: u.orders.length, addresses: u.addresses.length, wishlist: u.wishlist.length, reviews: u.reviews.length },
		activeReservation: g ? reservationInfo(g) : null, pendingReviewCount: 0,
	};
});
route("GET", "/me/orders", (ctx) => {
	const u = needUser(ctx);
	const filter = ctx.query.filter || "all";
	const sorted = [...u.orders].sort((a, b) => b.placedAt - a.placedAt);
	const list = sorted.filter((o) => filter === "all" || bucketOf(o) === filter);
	const count = (b) => u.orders.filter((o) => bucketOf(o) === b).length;
	return { ...paginate(list.map(orderSummary), ctx.query, 20), counts: { all: u.orders.length, current: count("current"), delivered: count("delivered"), cancelled: count("cancelled") } };
});
const myOrder = (ctx) => needUser(ctx).orders.find((o) => o.code === ctx.params.code) || fail(404, "ORDER_NOT_FOUND", "این سفارش پیدا نشد.");
/** Tabs of «سفارش‌های من»: current / delivered (incl. returns) / cancelled (incl. expired). */
function bucketOf(o) {
	const s = statusOf(o).status;
	if (["DELIVERED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(s)) return "delivered";
	if (["CANCELLED", "EXPIRED"].includes(s)) return "cancelled";
	return "current";
}
route("GET", "/me/orders/:code", (ctx) => orderDetail(myOrder(ctx)));
route("GET", "/me/orders/:code/media", (ctx) => orderDetail(myOrder(ctx)).preShipmentMediaDetail);
route("GET", "/me/reservation", (ctx) => {
	const g = activeGroup(needUser(ctx));
	if (!g) { ctx.status = 204; return undefined; }
	return reservationInfo(g);
});

// order actions — shown by `OrderSummary.actions`
route("POST", "/me/orders/:code/payments", (ctx) => {
	const u = needUser(ctx);
	const o = myOrder(ctx);
	if (o.paid !== false) fail(422, "ORDER_ALREADY_PAID", "این سفارش قبلاً پرداخت شده.");
	if (isExpired(o) || o.cancelledAt) fail(422, "PAYMENT_EXPIRED", "مهلت پرداخت این سفارش تموم شده و کیف‌ها به فروشگاه برگشتن.");
	const key = ctx.req.headers["idempotency-key"];
	if (key && idempotency.has(key)) return idempotency.get(key);
	const gateway = ctx.body?.gateway || o.gateway;
	if (!D.GATEWAYS.some((g) => g.code === gateway)) validation([{ field: "gateway", code: "ENUM", message: "درگاه پرداخت معتبر نیست" }]);
	// demo of the design: Saman is «not available» from the account
	if (gateway === "SAMAN") fail(422, "PAYMENT_GATEWAY_UNAVAILABLE", "درگاه بانک سامان الان در دسترس نیست؛ با یه درگاه دیگه پرداخت کن.");
	o.gateway = gateway;
	ctx.status = 201;
	const res = startPayment(o, u, gateway);
	if (key) idempotency.set(key, res);
	return res;
});
route("POST", "/me/orders/:code/reorder", (ctx) => {
	const o = myOrder(ctx);
	const c = resolveCart(ctx);
	const added = [], skipped = [];
	o.items.forEach((i) => {
		const p = getP(i.id);
		const label = `${p.n} (${D.COLOR_BY_KEY[i.color].name})`;
		if (!p.stock) return skipped.push({ productId: p.id, name: label, reason: "OUT_OF_STOCK" });
		addToCart(c, variantId(p, i.color), i.qty);
		added.push(p.n);
	});
	const message = !added.length
		? "کیف‌های این سفارش دیگه موجود نیستن."
		: skipped.length ? `${skipped.map((s) => s.name).join("، ")} دیگه موجود نیست؛ ${added.join("، ")} به سبدت اضافه شد` : `${fa(added.length)} کیف به سبد اضافه شد`;
	return { cart: cartView(c, ctx), addedCount: added.length, skipped, message };
});
const CANCEL_REASONS = ["CHANGED_MIND", "NOT_AS_PICTURED", "ORDERED_BY_MISTAKE", "FOUND_CHEAPER", "DELIVERY_TOO_LONG", "OTHER"];
route("POST", "/me/orders/:code/cancel", (ctx) => {
	const o = myOrder(ctx);
	const b = ctx.body || {};
	if (!CANCELLABLE.includes(statusOf(o).status)) fail(422, "ORDER_NOT_CANCELLABLE", "این سفارش ارسال شده و دیگه نمی‌شه لغوش کرد؛ بعد از تحویل تا ۷ روز می‌تونی مرجوعش کنی.");
	if (!CANCEL_REASONS.includes(b.reason)) validation([{ field: "reason", code: "REQUIRED", message: "دلیل لغو رو انتخاب کن" }]);
	if (b.note && String(b.note).length > 500) validation([{ field: "note", code: "MAX_LENGTH", message: "توضیح حداکثر ۵۰۰ حرف باشه" }]);
	const paid = o.paid !== false;
	o.cancelledAt = Date.now();
	o.refund = paid
		? { id: ++REFUND_SEQ, amount: o.totals.total, method: "ORIGINAL_PAYMENT", status: "PENDING", reason: "ORDER_CANCELLED", expectedBy: iso(Date.now() + 3 * DAY), completedAt: null, referenceId: null }
		: null;
	return { order: orderSummary(o), refund: o.refund, message: paid ? "سفارش لغو شد. مبلغ حداکثر تا ۷۲ ساعت به کارتت برمی‌گرده." : "سفارش لغو شد." };
});
route("POST", "/me/orders/:code/media-feedback", (ctx) => {
	const o = myOrder(ctx);
	const b = ctx.body || {};
	if (o.status >= 2 || o.cancelledAt) fail(422, "CHANGE_REQUEST_NOT_ALLOWED", "این سفارش ارسال شده و دیگه نمی‌شه تغییرش داد.");
	if (statusOf(o).status !== "PHOTO_SENT" || o.feedback) fail(422, "CHANGE_REQUEST_NOT_ALLOWED", "به عکس‌های این سفارش قبلاً جواب دادی.");
	if (!["APPROVE", "REQUEST_CHANGE"].includes(b.decision)) validation([{ field: "decision", code: "ENUM", message: "پاسخ معتبر نیست" }]);
	if (b.decision === "REQUEST_CHANGE") {
		const errors = [];
		if (!["COLOR", "MODEL", "CANCEL_ITEM", "OTHER"].includes(b.changeType)) errors.push({ field: "changeType", code: "ENUM", message: "نوع تغییر رو انتخاب کن" });
		if (b.orderItemId != null && !o.items[Number(b.orderItemId) - 1]) errors.push({ field: "orderItemId", code: "NOT_FOUND", message: "این کیف توی سفارش نیست" });
		if (["COLOR", "MODEL"].includes(b.changeType) && !variantById(b.desiredVariantId)) errors.push({ field: "desiredVariantId", code: "REQUIRED", message: "رنگ یا مدل جدید رو انتخاب کن" });
		if (b.changeType === "CANCEL_ITEM" && o.items.length < 2) errors.push({ field: "changeType", code: "NOT_ALLOWED", message: "سفارش یه کیف بیشتر نداره؛ لغوش کن" });
		if (b.changeType === "OTHER" && String(b.note || "").trim().length < 5) errors.push({ field: "note", code: "REQUIRED", message: "بنویس چه تغییری می‌خوای" });
		if (errors.length) validation(errors);
	}
	o.feedback = { decision: b.decision, changeType: b.changeType ?? null, orderItemId: b.orderItemId ?? null, desiredVariantId: b.desiredVariantId ?? null, note: b.note ?? null, at: Date.now() };
	return orderDetail(o);
});
const KIVA_FAULT = ["NOT_AS_PICTURED", "MANUFACTURING_DEFECT", "WRONG_ITEM", "DAMAGED_IN_TRANSIT"];
route("POST", "/me/orders/:code/returns", (ctx) => {
	const u = needUser(ctx);
	const o = myOrder(ctx);
	const b = ctx.body || {};
	if (o.status !== 3 || o.cancelledAt) fail(422, "ORDER_NOT_RETURNABLE", "این سفارش هنوز تحویل نشده؛ بعد از تحویل تا ۷ روز می‌تونی درخواست مرجوعی بدی.");
	if (Date.now() >= returnDeadline(o)) fail(422, "RETURN_WINDOW_EXPIRED", `مهلت ۷ روزه‌ی بازگشت این سفارش ${jdate(returnDeadline(o), { weekday: "long", day: "numeric", month: "long" })} تموم شد. اگه کیفت ایراد داره، با پشتیبانی در تماس باش تا بررسی‌اش کنیم.`);
	if (!o.items.some((_, j) => remainingQty(o, j) > 0)) fail(422, "ORDER_NOT_RETURNABLE", "برای همه‌ی کیف‌های این سفارش قبلاً درخواست مرجوعی ثبت شده.");
	const errors = [];
	const lines = Array.isArray(b.items) ? b.items : [];
	if (!lines.length) errors.push({ field: "items", code: "REQUIRED", message: "حداقل یه کیف رو انتخاب کن" });
	lines.forEach((l, i) => {
		const j = Number(l.orderItemId) - 1;
		if (!o.items[j]) errors.push({ field: `items[${i}].orderItemId`, code: "NOT_FOUND", message: "این کیف توی سفارش نیست" });
		else if (!(Number(l.quantity) >= 1 && Number(l.quantity) <= remainingQty(o, j))) errors.push({ field: `items[${i}].quantity`, code: "RANGE", message: "تعداد درست نیست" });
	});
	const KNOWN = [...KIVA_FAULT, "CHANGED_MIND", "OTHER"];
	if (!KNOWN.includes(b.reason)) errors.push({ field: "reason", code: "REQUIRED", message: "دلیل مرجوعی رو انتخاب کن" });
	if (b.description && String(b.description).length > 1000) errors.push({ field: "description", code: "MAX_LENGTH", message: "توضیح حداکثر ۱۰۰۰ حرف باشه" });
	const mediaIds = Array.isArray(b.mediaIds) ? b.mediaIds : [];
	if (mediaIds.length > 6 || mediaIds.some((id) => uploads.get(id)?.phone !== u.phone)) errors.push({ field: "mediaIds", code: "INVALID", message: "فایل‌های پیوست معتبر نیستن" });
	const refundMethod = b.refundMethod || "ORIGINAL_PAYMENT";
	if (!["ORIGINAL_PAYMENT", "BANK_TRANSFER", "STORE_CREDIT"].includes(refundMethod)) errors.push({ field: "refundMethod", code: "ENUM", message: "روش برگشت وجه معتبر نیست" });
	if (refundMethod === "BANK_TRANSFER" && !/^IR\d{24}$/.test(String(b.iban || ""))) errors.push({ field: "iban", code: "PATTERN", message: "شماره شبا باید ۲۴ رقم باشه" });
	if (errors.length) validation(errors);
	const id = ++RETURN_SEQ;
	const r = {
		id, code: `RT-${id}`, orderCode: o.code, status: "REQUESTED", reason: b.reason, description: b.description || null,
		items: lines.map((l) => { const it = o.items[Number(l.orderItemId) - 1]; return { orderItemId: Number(l.orderItemId), productId: it.id, color: it.color, quantity: Number(l.quantity) }; }),
		media: mediaIds.map((m) => uploads.get(m).asset), shippingPaidBy: b.reason === "CHANGED_MIND" ? "CUSTOMER" : KIVA_FAULT.includes(b.reason) ? "KIVA" : undefined,
		refundMethod, instructions: null, refund: null, createdAt: Date.now(), decidedAt: null,
	};
	o.returns.push(r);
	u.returns.push(r);
	ctx.status = 201;
	return returnView(r);
});
route("GET", "/me/returns", (ctx) => [...needUser(ctx).returns].sort((a, b) => b.createdAt - a.createdAt).map(returnView));
route("GET", "/me/orders/:code/invoice", (ctx) => {
	const o = myOrder(ctx);
	if (o.paid === false || o.cancelledAt) fail(404, "NOT_FOUND", "فاکتور این سفارش هنوز صادر نشده.");
	return { raw: invoicePdf(o), type: "application/pdf", filename: `${o.code}.pdf` };
});
/** A small valid one-page PDF (Latin text only — the real one comes from the backend). */
function invoicePdf(o) {
	const lines = [
		`KIVA - Invoice ${o.code}`, `Order date: ${tehranDate(o.placedAt)}`, "",
		...o.items.map((i) => { const p = getP(i.id); return `${p.slug} (${i.color}) x${i.qty}   ${p.price * i.qty} IRT`; }),
		"", `Shipping: ${o.totals.ship} IRT`, `Total paid: ${o.totals.total} IRT`,
	];
	const text = lines.map((l, i) => `BT /F1 12 Tf 56 ${780 - i * 20} Td (${l.replace(/[()\\]/g, "\\$&")}) Tj ET`).join("\n");
	const objs = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
		`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
	];
	let pdf = "%PDF-1.4\n";
	const offsets = objs.map((obj, i) => { const at = Buffer.byteLength(pdf); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; return at; });
	const xref = Buffer.byteLength(pdf);
	pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("")}`;
	pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
	return Buffer.from(pdf, "latin1");
}
route("POST", "/me/uploads", (ctx) => {
	const u = needUser(ctx);
	const file = ctx.multipart?.file;
	if (!file || !["RETURN_EVIDENCE", "REVIEW_PHOTO"].includes(ctx.multipart.fields.purpose)) validation([{ field: "file", code: "REQUIRED", message: "فایلی فرستاده نشد" }]);
	const video = file.type === "video/mp4";
	if (!video && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) fail(415, "UPLOAD_TYPE_NOT_ALLOWED", "فقط عکس jpg، png، webp یا ویدیو mp4 قبول می‌شه.");
	if (file.size > (video ? 50 : 8) * 1024 * 1024) fail(413, "UPLOAD_TOO_LARGE", video ? "حجم ویدیو بیشتر از ۵۰ مگابایته." : "حجم عکس بیشتر از ۸ مگابایته.");
	const id = rid("up");
	// the mock keeps no bytes — a bag picture stands in for the file
	const asset = { id, type: video ? "VIDEO" : "IMAGE", url: `${ORIGIN}/media/bag/tote/lilac.svg?up=${id}`, thumbnailUrl: `${ORIGIN}/media/bag/tote/lilac.svg?up=${id}`, alt: file.name, mimeType: file.type };
	uploads.set(id, { phone: u.phone, asset });
	ctx.status = 201;
	return asset;
});
route("GET", "/me/tracking", (ctx) => {
	const u = needUser(ctx);
	const groups = new Map();
	[...u.orders].filter((o) => o.trackingCode).sort((a, b) => b.placedAt - a.placedAt).forEach((o) => {
		const t = o.placedAt + 2 * DAY;
		const key = tehranDate(t);
		if (!groups.has(key)) groups.set(key, { date: key, label: jdate(t, { weekday: "long", day: "numeric", month: "long" }), shipments: [] });
		groups.get(key).shipments.push({ orderCode: o.code, carrier: o.shippingMethod, carrierName: shipName(o.shippingMethod), trackingCode: o.trackingCode, trackingUrl: D.SHIPPING[o.shippingMethod].trackingUrl });
	});
	return [...groups.values()];
});
route("GET", "/me/reviews", (ctx) => {
	const u = needUser(ctx);
	const items = u.reviews.map((r) => {
		const p = getP(r.productId);
		return {
			id: r.id, productId: p.id, product: { id: p.id, slug: p.slug, sku: `KV-${1000 + p.id}`, name: p.n, imageUrl: img(p, p.colors[0]) },
			authorName: u.firstName || "کاربر کیوا", authorInitial: (u.firstName || "ک")[0], rating: r.rating, title: null, text: r.text, createdAt: iso(r.createdAt),
			status: r.status, statusLabel: r.status === "APPROVED" ? "منتشر شده" : "در انتظار تأیید", isVerifiedBuyer: true,
			reply: r.reply ? { text: r.reply, authorName: "کیوا", createdAt: iso(r.createdAt + DAY) } : null, helpfulCount: 0, isMine: true,
		};
	});
	return { ...paginate(items, ctx.query, 20), counts: { total: items.length, pending: items.filter((r) => r.status === "PENDING").length, approved: items.filter((r) => r.status === "APPROVED").length } };
});

// addresses
route("GET", "/me/addresses", (ctx) => [...needUser(ctx).addresses].sort((a, b) => b.isDefault - a.isDefault).map(addressView));
route("POST", "/me/addresses", (ctx) => {
	const u = needUser(ctx);
	const errors = validateAddressInput(ctx.body);
	if (errors.length) validation(errors);
	if (u.addresses.length >= 20) fail(422, "ADDRESS_LIMIT_REACHED", "حداکثر ۲۰ آدرس می‌تونی ذخیره کنی.");
	const a = toAddress(ctx.body, ++ADDR_SEQ);
	if (!u.addresses.length || ctx.body.setAsDefault) { u.addresses.forEach((x) => (x.isDefault = false)); a.isDefault = true; }
	u.addresses.push(a);
	ctx.status = 201;
	return addressView(a);
});
const myAddress = (ctx) => needUser(ctx).addresses.find((a) => a.id === Number(ctx.params.id)) || fail(404, "ADDRESS_NOT_FOUND", "آدرس پیدا نشد.");
route("GET", "/me/addresses/:id", (ctx) => addressView(myAddress(ctx)));
route("PUT", "/me/addresses/:id", (ctx) => {
	const a = myAddress(ctx);
	const errors = validateAddressInput(ctx.body);
	if (errors.length) validation(errors);
	Object.assign(a, toAddress(ctx.body, a.id), { isDefault: a.isDefault, createdAt: a.createdAt });
	return addressView(a);
});
route("DELETE", "/me/addresses/:id", (ctx) => {
	const u = needUser(ctx);
	const a = myAddress(ctx);
	u.addresses = u.addresses.filter((x) => x !== a);
	if (a.isDefault && u.addresses[0]) u.addresses[0].isDefault = true;
	ctx.status = 204;
});
route("POST", "/me/addresses/:id/default", (ctx) => {
	const u = needUser(ctx);
	const a = myAddress(ctx);
	u.addresses.forEach((x) => (x.isDefault = x === a));
	return [...u.addresses].sort((x, y) => y.isDefault - x.isDefault).map(addressView);
});

// wishlist
const wishItem = (w, ctx) => {
	const p = getP(w.productId);
	const off = offPct(p);
	return {
		product: summary(p, ctx, w.colorKey), addedAt: iso(w.addedAt), preferredColorKey: w.colorKey, priceAtAdd: w.priceAtAdd,
		priceDrop: p.old && p.stock ? { amount: p.old - p.price, percent: off, label: `از وقتی ذخیره کردی ${fa(off)}٪ ارزون‌تر شده` } : null,
	};
};
route("GET", "/me/wishlist", (ctx) => {
	const u = needUser(ctx);
	const items = u.wishlist.map((w) => wishItem(w, ctx));
	return { ...paginate(items, ctx.query, 48), count: items.length, inStockCount: u.wishlist.filter((w) => getP(w.productId).stock).length, share: u.share || null };
});
route("DELETE", "/me/wishlist", (ctx) => { needUser(ctx).wishlist = []; ctx.status = 204; });
route("GET", "/me/wishlist/ids", (ctx) => { const u = needUser(ctx); return { productIds: u.wishlist.map((w) => w.productId), count: u.wishlist.length }; });
route("PUT", "/me/wishlist/items/:id", (ctx) => {
	const u = needUser(ctx);
	const p = findProduct(ctx.params.id);
	if (!u.wishlist.some((w) => w.productId === p.id)) u.wishlist.unshift({ productId: p.id, addedAt: Date.now(), colorKey: ctx.body?.colorKey || null, priceAtAdd: p.price });
	return { productId: p.id, wishlisted: true, count: u.wishlist.length, message: "به علاقه‌مندی‌ها اضافه شد" };
});
route("DELETE", "/me/wishlist/items/:id", (ctx) => {
	const u = needUser(ctx);
	const p = findProduct(ctx.params.id);
	u.wishlist = u.wishlist.filter((w) => w.productId !== p.id);
	return { productId: p.id, wishlisted: false, count: u.wishlist.length, message: "از علاقه‌مندی‌ها حذف شد" };
});
route("POST", "/me/wishlist/add-to-cart", (ctx) => {
	const u = needUser(ctx);
	const c = resolveCart(ctx);
	const ids = ctx.body?.productIds?.length ? ctx.body.productIds.map(Number) : u.wishlist.map((w) => w.productId);
	let added = 0;
	const skipped = [];
	ids.forEach((id) => {
		const p = getP(id); const w = u.wishlist.find((x) => x.productId === id);
		if (!p.stock) { skipped.push({ productId: id, name: p.n, reason: "OUT_OF_STOCK" }); return; }
		addToCart(c, variantId(p, w?.colorKey || p.colors[0]), 1); added++;
	});
	return { cart: cartView(c, ctx), addedCount: added, skipped, message: `${fa(added)} کیف به سبد اضافه شد` };
});
route("POST", "/me/wishlist/share", (ctx) => {
	const u = needUser(ctx);
	u.share = u.share || { token: rid("wl"), createdAt: iso(Date.now()) };
	return { ...u.share, url: `${FE_ORIGIN}/wishlist/shared/${u.share.token}` };
});
route("GET", "/wishlists/shared/:token", (ctx) => {
	const u = [...users.values()].find((x) => x.share?.token === ctx.params.token) || fail(404, "NOT_FOUND", "این لیست پیدا نشد یا دیگه به اشتراک گذاشته نمی‌شه.");
	return { ownerDisplayName: u.firstName || "دوست کیوا", items: u.wishlist.map((w) => summary(getP(w.productId), ctx, w.colorKey)) };
});

// blog
route("GET", "/blog/categories", () => blogCats());
route("GET", "/blog/posts", (ctx) => {
	const { category, q, page } = ctx.query;
	const match = (p) => (!category || p.catSlug === category) && (!q || (p.t + p.ex).includes(normQ(q)));
	const featuredPost = D.POSTS[0];
	const featured = (Number(page) || 1) === 1 && match(featuredPost) ? postSummary(featuredPost, "big") : null;
	const list = D.POSTS.slice(1).filter(match).map((p) => postSummary(p));
	const res = paginate(list, ctx.query, 9);
	return { featured, ...res, emptyMessage: list.length ? null : "مقاله‌ای با این مشخصات پیدا نشد." };
});
const findPost = (key) => D.POSTS.find((p) => String(p.id) === key || p.slug === key) || fail(404, "NOT_FOUND", "این مقاله پیدا نشد.");
route("GET", "/blog/posts/:key", (ctx) => {
	const p = findPost(decodeURIComponent(ctx.params.key));
	const prodP = D.PRODUCTS.find((x) => x.bag === p.bag && x.stock) || D.PRODUCTS[0];
	const blocks = [];
	p.body.forEach(([h, txt], i) => {
		blocks.push({ type: "HEADING", anchor: `s${i}`, text: h }, { type: "PARAGRAPH", text: txt });
		if (i === 0) blocks.push({ type: "QUOTE", text: "کیف خوب، کیفیه که هم با استایلت هماهنگ باشه و هم با زندگی روزمره‌ت." });
		if (i === 1) blocks.push({ type: "PRODUCT", product: summary(prodP, ctx) });
		if (i === 2) blocks.push({ type: "TIP", title: "نکته کیوا", text: "قبل از خرید، از ما ویدیوی کیف رو در کنار وسایل روزمره بخواه تا اندازه‌ش رو دقیق‌تر ببینی." });
	});
	const url = `https://kiva.ir/blog/${p.slug}`;
	return {
		...postSummary(p, "wide"), lead: p.ex, blocks, toc: p.body.map(([h], i) => ({ anchor: `s${i}`, title: h })),
		breadcrumbs: [{ label: "خانه", url: "/" }, { label: "بلاگ", url: "/blog" }, { label: p.cat, url: null }],
		shareUrl: url,
		shareLinks: [
			{ channel: "TELEGRAM", name: "تلگرام", url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.t)}` },
			{ channel: "BALE", name: "بله", url: "https://ble.ir/" },
		],
		helpfulStats: { helpfulCount: 120, notHelpfulCount: 6 }, seo: { title: `${p.t} | بلاگ کیوا` }, updatedAt: `${p.d}T08:00:00Z`,
	};
});
route("GET", "/blog/posts/:id/related", (ctx) => {
	const p = findPost(ctx.params.id);
	return D.POSTS.filter((x) => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat)).slice(0, Number(ctx.query.limit) || 3).map((x) => postSummary(x));
});
route("POST", "/blog/posts/:id/feedback", (ctx) => { findPost(ctx.params.id); ctx.status = 204; });

// ───────────────────────────── server ─────────────────────────────
function sendMedia(res, path, query) {
	let m = path.match(/^\/media\/bag\/(\w+)\/(\w+)\.svg$/);
	if (m) { res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" }); res.end(bagSVG(m[1], m[2], { v: Number(query.v) || 0 })); return true; }
	m = path.match(/^\/media\/post\/(\d+)\.svg$/);
	if (m) { const p = D.POSTS.find((x) => x.id === Number(m[1])); if (p) { res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" }); res.end(postCover(p, query.kind || "card")); return true; } }
	return false;
}

/** Stand-in for the bank: `/mock-gateway/:id` shows the amount; `/ok` or `/cancel` settles it and returns to the FE result page. */
function sendGateway(res, path) {
	const m = path.match(/^\/mock-gateway\/(\w+)(?:\/(ok|cancel))?$/);
	if (!m) return false;
	const pay = payments.get(m[1]);
	if (!pay) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("این پرداخت پیدا نشد."); return true; }
	if (m[2]) {
		if (pay.status === "PENDING") {
			pay.status = m[2] === "ok" ? "SUCCEEDED" : "CANCELLED";
			if (pay.status === "SUCCEEDED") {
				pay.paidAt = Date.now();
				const u = getUserByPhone(pay.phone);
				const o = u?.orders.find((x) => x.code === pay.orderCode);
				if (o) {
					o.paid = true; o.failed = false; o.placedAt = Date.now();
					// the reservation clock starts at the first order's successful payment
					if (o.reserve && !o.group) joinOrStartGroup(u, o);
				}
			} else {
				const o = getUserByPhone(pay.phone)?.orders.find((x) => x.code === pay.orderCode);
				if (o && o.paid === false) o.failed = true;
			}
		}
		res.writeHead(302, { Location: `${FE_ORIGIN}/checkout/result?paymentId=${m[1]}` });
		res.end();
		return true;
	}
	const name = D.GATEWAYS.find((g) => g.code === pay.gateway)?.name ?? pay.gateway;
	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
	res.end(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>درگاه آزمایشی — ${esc(name)}</title>
<style>body{font-family:Tahoma,sans-serif;background:#F3EEFA;display:grid;place-items:center;min-height:100vh;margin:0}main{background:#fff;border-radius:20px;padding:32px;width:min(380px,90vw);text-align:center;box-shadow:0 20px 50px -30px rgba(91,62,140,.6)}
h1{font-size:18px}p{color:#6b6280}b{font-size:22px;display:block;margin:12px 0 24px}a{display:block;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:10px}.ok{background:#5B3E8C;color:#fff}.no{border:1.5px solid #ddd;color:#2A1F3D}</style></head>
<body><main><h1>درگاه آزمایشی ${esc(name)}</h1><p>سفارش ${esc(pay.orderCode)} — فقط برای محیط توسعه</p><b>${price(pay.amount)} تومان</b>
<a class="ok" href="/mock-gateway/${m[1]}/ok">پرداخت موفق</a><a class="no" href="/mock-gateway/${m[1]}/cancel">انصراف از پرداخت</a></main></body></html>`);
	return true;
}

/** Just enough multipart parsing for `POST /me/uploads`: the text fields and the file's name, type and size. */
function parseMultipart(buf, contentType) {
	const m = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);
	const out = { fields: {}, file: null };
	if (!m) return out;
	const text = buf.toString("latin1");
	text.split(`--${m[1] || m[2]}`).forEach((part) => {
		const cut = part.indexOf("\r\n\r\n");
		if (cut < 0) return;
		const head = part.slice(0, cut);
		const body = part.slice(cut + 4).replace(/\r\n$/, "");
		const name = /name="([^"]*)"/.exec(head)?.[1];
		const filename = /filename="([^"]*)"/.exec(head)?.[1];
		if (filename != null) out.file = { name: Buffer.from(filename, "latin1").toString("utf8"), type: (/Content-Type:\s*([^\r\n]+)/i.exec(head)?.[1] || "").trim(), size: body.length };
		else if (name) out.fields[name] = Buffer.from(body, "latin1").toString("utf8");
	});
	return out;
}

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, ORIGIN);
	const cors = {
		"Access-Control-Allow-Origin": req.headers.origin || "*",
		"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type,Authorization,X-Cart-Token,Idempotency-Key,If-Match",
		"Access-Control-Expose-Headers": "X-Cart-Token,Retry-After",
		Vary: "Origin",
	};
	if (req.method === "OPTIONS") { res.writeHead(204, cors); res.end(); return; }
	if (url.pathname.startsWith("/media/") && sendMedia(res, url.pathname, Object.fromEntries(url.searchParams))) return;
	if (url.pathname.startsWith("/mock-gateway/") && sendGateway(res, url.pathname)) return;

	const send = (status, body, headers = {}, type = "application/json; charset=utf-8") => {
		res.writeHead(status, { ...cors, ...headers, ...(body === undefined ? {} : { "Content-Type": type }) });
		res.end(body === undefined ? undefined : JSON.stringify(body));
	};
	const path = url.pathname.startsWith(API) ? url.pathname.slice(API.length) || "/" : null;
	const r = path && routes.find((x) => x.method === req.method && x.re.test(path));
	if (!r) { send(404, undefined); return; } // bare 404 (no problem body) → the FE's NOT_FOUND

	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	const raw = Buffer.concat(chunks);
	const multipart = /multipart\/form-data/.test(req.headers["content-type"] || "");
	const auth = String(req.headers.authorization || "");
	const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
	const ctx = {
		req, headers: {}, status: 200, token, query: Object.fromEntries(url.searchParams),
		params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(path.match(r.re)[i + 1])])),
		user: token && access.has(token) && accessExpiry.get(token) > Date.now() ? users.get(access.get(token)) : null,
	};
	await new Promise((ok) => setTimeout(ok, DELAY));
	try {
		if (token && !ctx.user) fail(401, "TOKEN_EXPIRED", "نشستت منقضی شده؛ دوباره تلاش کن.");
		ctx.body = raw.length && !multipart ? JSON.parse(raw.toString("utf8")) : null;
		ctx.multipart = multipart ? parseMultipart(raw, req.headers["content-type"]) : null;
		const out = await r.handler(ctx);
		if (out?.raw) {
			res.writeHead(ctx.status, { ...cors, "Content-Type": out.type, "Content-Disposition": `attachment; filename="${out.filename}"` });
			res.end(out.raw);
		} else send(ctx.status, ctx.status === 204 ? undefined : out, ctx.headers);
		console.log(`${req.method} ${url.pathname}${url.search} → ${ctx.status}`);
	} catch (e) {
		if (!(e instanceof ApiError)) { console.error(e); e = new ApiError(500, "INTERNAL_ERROR", "یه مشکلی سمت سرور پیش اومد. دوباره امتحان کن."); }
		send(e.status, { type: `https://kiva.ir/problems/${e.code.toLowerCase().replace(/_/g, "-")}`, title: e.code, status: e.status, code: e.code, message: e.message, instance: url.pathname, traceId: randomUUID().slice(0, 16), ...e.extra }, ctx.headers, "application/problem+json; charset=utf-8");
		console.log(`${req.method} ${url.pathname}${url.search} → ${e.status} ${e.code}`);
	}
});
server.listen(PORT, () => console.log(`KIVA mock API ready → ${ORIGIN}${API}  (OTP: any 5 digits, 00000 fails)`));
