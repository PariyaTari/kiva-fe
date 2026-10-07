import { BAG_COLORS } from "@/app/_components/shop/bagArt/bagMarkup";
import { BagKey } from "@/app/_components/shop/bagArt/bagArt.type";
import { Banner, HomeFeature, HomePage, HowItWorksStep } from "../_types/home.type";

/**
 * The home page's fixed content — owned by this project, not the backend's `GET /home` (edit here and redeploy).
 * The catalog parts (categories, new arrivals, sale, testimonials) stay live: `loadHomePage` reads them from the
 * backend on the server.
 */

/** The hero picture: the design's illustrated bag, drawn by `/kiva-configs/hero.svg`. */
export const HERO_ART: { bag: BagKey; color: string } = { bag: "hobo", color: "lilac" };

/** How many cards the «جدیدترین‌ها» row and the testimonials carousel get. */
export const NEW_ARRIVALS_COUNT = 8;
export const TESTIMONIALS_COUNT = 8;

export const HERO: HomePage["hero"] = {
	eyebrow: "امضای کیوا: عکس قبل از ارسال",
	title: "هرچی ببینی، همون می‌رسه.",
	text: "قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس و ویدیو می‌گیریم و توی روبیکا، تلگرام یا بله برات می‌فرستیم. بدون غافلگیری.",
	primaryCta: { label: "مشاهده محصولات", url: "/products" },
	secondaryCta: { label: "چطور کار می‌کنیم؟", url: "#how" },
	// a fixed picture and labels — no price or colour picker, nothing that could go stale
	showcase: {
		image: { url: "/kiva-configs/hero.svg", alt: "کیف دوشی ماهک رنگ یاسی" },
		name: "کیف دوشی ماهک",
		category: "کیف دوشی",
		colorName: "یاسی",
		colorHex: BAG_COLORS[HERO_ART.color],
		messenger: "TELEGRAM",
	},
};

export const FEATURES: HomeFeature[] = [
	{ icon: "camera", title: "عکس قبل از ارسال", subtitle: "کیف خودت رو قبل از ارسال ببین" },
	{ icon: "timer", title: "رزرو ۴ روزه", subtitle: "چند خرید، یک هزینه ارسال" },
	{ icon: "truck", title: "ارسال سریع", subtitle: "تیپاکس یا پست، به انتخاب خودت" },
	{ icon: "refresh", title: "۷ روز ضمانت بازگشت", subtitle: "اگه همونی نبود که دیدی" },
];

export const PROMOS: Banner[] = [
	{
		id: 1,
		placement: "HOME_PROMO",
		theme: "CREAM",
		tag: { label: "رزرو ۴ روزه", icon: "timer" },
		title: "الان بخر،\nهمه رو یکجا تحویل بگیر",
		text: "پول کیف رو بده و تا ۴ روز رزروش کن؛ هر خرید دیگه‌ای هم داشتی، همه با یک هزینه ارسال می‌رسه.",
		cta: { label: "بیشتر بدونم", url: "/faq#reserve" },
		image: {
			id: "bn1",
			type: "IMAGE",
			url: "https://images.unsplash.com/photo-1681747685985-a401c271156c?auto=format&fit=crop&w=800&q=80",
			alt: "کیف صورتی روی سنگ مرمر",
		},
		overlay: { highlight: "4", title: "روز رزرو", subtitle: "یک هزینه ارسال", channel: null },
		sortOrder: 1,
	},
	{
		id: 2,
		placement: "HOME_PROMO",
		theme: "PURPLE",
		tag: { label: "امضای کیوا", icon: "camera" },
		title: "کیف خودت رو\nقبل از ارسال ببین",
		text: "پیام‌رسانت رو انتخاب کن؛ عکس و ویدیوی کیفی که برات بسته‌بندی می‌کنیم همون‌جا و توی حسابت می‌رسه.",
		cta: { label: "چطوری؟", url: "#how" },
		image: {
			id: "bn2",
			type: "IMAGE",
			url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
			alt: "کیف چرمی سبزآبی از نمای بالا",
		},
		overlay: { highlight: null, title: "عکس کیف شما", subtitle: "در بله ارسال شد", channel: "BALE" },
		sortOrder: 2,
	},
];

export const HOW_IT_WORKS: HowItWorksStep[] = [
	{ step: 1, title: "عکس و ویدیوی واقعی محصول", text: "هر کیف با عکس و ویدیوی واقعی خودش توی سایته؛ بدون فیلتر و بدون ادیت اغراق‌آمیز.", isSignature: false },
	{
		step: 2,
		title: "عکس کیف خودت، قبل از ارسال",
		text: "قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس یا ویدیو می‌گیریم و توی روبیکا، تلگرام یا بله برات می‌فرستیم.",
		isSignature: true,
	},
	{ step: 3, title: "تحویل، همونی که دیدی", text: "کیف با بسته‌بندی کیوا به دستت می‌رسه. عکسش هم برای همیشه توی جزئیات سفارشت می‌مونه.", isSignature: false },
];
