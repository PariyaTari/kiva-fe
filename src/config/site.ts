import { SiteConfig } from "@/types/siteConfig.type";

/**
 * The storefront's settings — header, footer, drawers, contact, pay modal. Static content owned by this project
 * (not the backend's `GET /config`): served at `/kiva-configs/config` by `app/kiva-configs/config/route.ts`, and the shell's first
 * paint until that answers. Edit here and redeploy.
 */
export const SITE_CONFIG: SiteConfig = {
	brand: {
		name: "کیوا",
		slogan: "هرچی ببینی، همون می‌رسه.",
		about: "کیوا فروشگاه آنلاین کیف‌های مینیمال و باکیفیته. قبل از ارسال، از همون کیفی که برات کنار گذاشتیم عکس می‌گیریم و برات می‌فرستیم تا با خیال راحت خرید کنی.",
		logoUrl: "/images/logo/kiva-logo-primary.svg",
		logoWhiteUrl: "/images/logo/kiva-logo-white.svg",
		faviconUrl: "/icon.svg",
	},
	currency: { code: "IRT", label: "تومان" },
	announcements: [
		{ id: 1, icon: "camera", text: "هرچی ببینی، همون می‌رسه — قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم" },
		{ id: 2, icon: "truck", text: "ارسال رایگان با پست برای خریدهای بالای ۳٬۰۰۰٬۰۰۰ تومان" },
		{ id: 3, icon: "timer", text: "رزرو ۴ روزه: الان بخر، چند روز بعد همه رو یکجا تحویل بگیر" },
	],
	shipping: {
		methods: [
			{ code: "TIPAX", name: "تیپاکس", description: "تحویل ۱ تا ۲ روز کاری", baseCost: 145000, minDays: 1, maxDays: 2, icon: "truck", isActive: true },
			{ code: "POST", name: "پست معمولی", description: "تحویل ۳ تا ۵ روز کاری", baseCost: 75000, minDays: 3, maxDays: 5, icon: "box", isActive: true },
		],
		freeShippingThreshold: 3000000,
		freeShippingMethods: ["POST"],
		nonShippingWeekdays: ["FRIDAY"],
	},
	reservation: { enabled: true, holdDays: 4, description: "الان کامل پرداخت کن، ۴ روز بعد برات ارسال می‌شه." },
	returns: { windowDays: 7, policyUrl: "/faq#return" },
	preShipmentPhoto: {
		enabled: true,
		required: true,
		channels: [
			{ channel: "RUBIKA", name: "روبیکا", hint: "با شماره موبایل", enabled: true },
			{ channel: "TELEGRAM", name: "تلگرام", hint: "با آیدی یا شماره", enabled: true },
			{ channel: "BALE", name: "بله", hint: "با شماره موبایل", enabled: true },
		],
		title: "قبل از ارسال، عکس همین کیف رو می‌بینی",
		description: "بعد از ثبت سفارش، از کیفی که برات کنار می‌ذاریم عکس و ویدیو می‌گیریم و توی پیام‌رسانت می‌فرستیم.",
	},
	inventory: { lowStockThreshold: 5 },
	auth: { otpLength: 5, resendCooldownSeconds: 120 },
	support: {
		phone: "02191001234",
		phoneDisplay: "۰۲۱-۹۱۰۰۱۲۳۴",
		email: "support@kiva.ir",
		emailResponseHint: "پاسخ تا ۲۴ ساعت",
		responseTimeHint: "معمولاً کمتر از یک ساعت جواب می‌دیم",
		hours: [
			{ label: "شنبه تا چهارشنبه", weekdays: ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY"], from: "09:00", to: "21:00", messengerOnly: false },
			{ label: "پنجشنبه", weekdays: ["THURSDAY"], from: "10:00", to: "18:00", messengerOnly: false },
			{ label: "جمعه و تعطیلات", weekdays: ["FRIDAY"], from: null, to: null, messengerOnly: true },
		],
	},
	social: [
		{ channel: "RUBIKA", name: "روبیکا", url: "https://rubika.ir/kiva_shop", handle: "@kiva_shop" },
		{ channel: "BALE", name: "بله", url: "https://ble.ir/kiva_shop", handle: "@kiva_shop" },
		{ channel: "TELEGRAM", name: "تلگرام", url: "https://t.me/kiva_shop", handle: "@kiva_shop" },
		{ channel: "INSTAGRAM", name: "اینستاگرام", url: "https://instagram.com/kiva.shop", handle: "@kiva.shop" },
	],
	trustBadges: [
		{ type: "ENAMAD", label: "نماد اعتماد الکترونیکی", linkUrl: "#" },
		{ type: "SAMANDEHI", label: "نشان ساماندهی", linkUrl: "#" },
	],
	footerLinks: [
		{
			group: "فروشگاه",
			links: [
				{ label: "کیف دوشی", url: "/products?category=shoulder" },
				{ label: "کیف دستی", url: "/products?category=hand" },
				{ label: "کراس‌بادی", url: "/products?category=cross" },
				{ label: "کوله‌پشتی", url: "/products?category=backpack" },
				{ label: "کیف مجلسی", url: "/products?category=party" },
				{ label: "تخفیف‌دارها", url: "/products?onSale=true" },
			],
		},
		{
			group: "راهنمای خرید",
			links: [
				{ label: "پیگیری سفارش", url: "/track" },
				{ label: "کدهای رهگیری روزانه", url: "/track#daily" },
				{ label: "سوالات متداول", url: "/faq" },
				{ label: "رزرو ۴ روزه", url: "/faq#reserve" },
				{ label: "شرایط ارسال", url: "/faq#shipping" },
				{ label: "بازگشت کالا", url: "/faq#return" },
				// not in the design footer — the terms page has to be one click away from every page (e-Namad)
				{ label: "قوانین و حریم خصوصی", url: "/pages/terms" },
			],
		},
	],
	// the design's gateways (pay modal of an unpaid order)
	paymentGateways: [
		{ code: "ZARINPAL", name: "زرین‌پال", brandColor: "#F2C230", initial: "ز", isDefault: true, available: true },
		{ code: "SAMAN", name: "بانک سامان", brandColor: "#1D5FA8", initial: "س", available: true },
		{ code: "MELLAT", name: "بانک ملت", brandColor: "#C8102E", initial: "م", available: true },
	],
	productPerks: [
		{ icon: "truck", title: "ارسال سریع", subtitle: "تیپاکس یا پست" },
		{ icon: "timer", title: "رزرو ۴ روزه", subtitle: "یکجا تحویل بگیر" },
		{ icon: "refresh", title: "۷ روز بازگشت", subtitle: "بدون دردسر" },
	],
	features: { wishlistShare: true, reviewMedia: false, giftWrap: false },
};

/** Support hours line of the footer and contact cards (the design prints it as one phrase). */
export const SUPPORT_HOURS_SUMMARY = "شنبه تا پنجشنبه، ۹ تا ۲۱";
