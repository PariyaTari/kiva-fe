/**
 * Static brand & storefront settings used by the site shell. These mirror `SiteConfig` from the
 * backend (`GET /config`) and are the fallback until that endpoint is wired in.
 */

export type MessengerKey = "rubika" | "bale" | "telegram" | "instagram";

export type SocialLink = {
	key: MessengerKey;
	label: string;
	url: string;
};

export type Announcement = {
	icon: "camera" | "truck" | "timer";
	text: string;
};

export const BRAND = {
	name: "کیوا",
	slogan: "هرچی ببینی، همون می‌رسه.",
	about:
		"کیوا فروشگاه آنلاین کیف‌های مینیمال و باکیفیته. قبل از ارسال، از همون کیفی که برات کنار گذاشتیم عکس می‌گیریم و برات می‌فرستیم تا با خیال راحت خرید کنی.",
} as const;

export const SUPPORT = {
	phone: "02191001234",
	phoneDisplay: "۰۲۱-۹۱۰۰۱۲۳۴",
	email: "support@kiva.ir",
	hours: "شنبه تا پنجشنبه، ۹ تا ۲۱",
} as const;

export const SOCIAL_LINKS: SocialLink[] = [
	{ key: "rubika", label: "روبیکا", url: "https://rubika.ir/kiva_shop" },
	{ key: "bale", label: "بله", url: "https://ble.ir/kiva_shop" },
	{ key: "telegram", label: "تلگرام", url: "https://t.me/kiva_shop" },
	{ key: "instagram", label: "اینستاگرام", url: "https://instagram.com/kiva.shop" },
];

export const ANNOUNCEMENTS: Announcement[] = [
	{ icon: "camera", text: "هرچی ببینی، همون می‌رسه — قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم" },
	{ icon: "truck", text: "ارسال رایگان با پست برای خریدهای بالای ۳٬۰۰۰٬۰۰۰ تومان" },
	{ icon: "timer", text: "رزرو ۴ روزه: الان بخر، چند روز بعد همه رو یکجا تحویل بگیر" },
];
