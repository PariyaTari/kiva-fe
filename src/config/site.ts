import { SiteConfig } from "@/types/siteConfig.type";

/**
 * What the shell shows until `GET /config` answers (or if it fails) — the design's static values,
 * in the `SiteConfig` shape so the header/footer render the same either way.
 */
export const FALLBACK_CONFIG: SiteConfig = {
	brand: {
		name: "کیوا",
		slogan: "هرچی ببینی، همون می‌رسه.",
		about: "کیوا فروشگاه آنلاین کیف‌های مینیمال و باکیفیته. قبل از ارسال، از همون کیفی که برات کنار گذاشتیم عکس می‌گیریم و برات می‌فرستیم تا با خیال راحت خرید کنی.",
	},
	announcements: [
		{ id: 1, icon: "camera", text: "هرچی ببینی، همون می‌رسه — قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم" },
		{ id: 2, icon: "truck", text: "ارسال رایگان با پست برای خریدهای بالای ۳٬۰۰۰٬۰۰۰ تومان" },
		{ id: 3, icon: "timer", text: "رزرو ۴ روزه: الان بخر، چند روز بعد همه رو یکجا تحویل بگیر" },
	],
	shipping: { methods: [], freeShippingThreshold: 3000000 },
	support: { phone: "02191001234", phoneDisplay: "۰۲۱-۹۱۰۰۱۲۳۴", email: "support@kiva.ir" },
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
			],
		},
	],
};

/** Support hours line of the footer and contact cards (the design prints it as one phrase). */
export const SUPPORT_HOURS_SUMMARY = "شنبه تا پنجشنبه، ۹ تا ۲۱";
