import type { ComponentType } from "react";
import { svgIcon } from "@/app/_components/icon/icon.types";
import { IconBox, IconChat, IconHeart, IconUser } from "@/app/_components/icon/icons";

export type NavItem = {
	label: string;
	href: string;
	icon?: ComponentType<svgIcon>;
};

export type NavGroup = {
	title: string;
	items: NavItem[];
};

/** Main menu — header bar on desktop, top of the drawer on mobile. */
export const MAIN_NAV: NavItem[] = [
	{ label: "خانه", href: "/" },
	{ label: "فروشگاه", href: "/products" },
	{ label: "بلاگ", href: "/blog" },
	{ label: "درباره ما", href: "/about" },
	{ label: "تماس با ما", href: "/contact" },
];

/** Shortcuts that live in the header actions on desktop but move into the drawer on mobile. */
export const MOBILE_EXTRA_NAV: NavItem[] = [
	{ label: "علاقه‌مندی‌ها", href: "/wishlist", icon: IconHeart },
	{ label: "حساب کاربری", href: "/account", icon: IconUser },
	{ label: "پیگیری سفارش", href: "/track", icon: IconBox },
	{ label: "سوالات متداول", href: "/faq", icon: IconChat },
];

/**
 * Footer link columns — mirrors `SiteConfig.footerLinks`. Shop links use the `/products` query
 * contract of the backend (`category` = category slug, `onSale`).
 */
export const FOOTER_GROUPS: NavGroup[] = [
	{
		title: "فروشگاه",
		items: [
			{ label: "کیف دوشی", href: "/products?category=shoulder" },
			{ label: "کیف دستی", href: "/products?category=hand" },
			{ label: "کراس‌بادی", href: "/products?category=cross" },
			{ label: "کوله‌پشتی", href: "/products?category=backpack" },
			{ label: "کیف مجلسی", href: "/products?category=party" },
			{ label: "تخفیف‌دارها", href: "/products?onSale=true" },
		],
	},
	{
		title: "راهنمای خرید",
		items: [
			{ label: "پیگیری سفارش", href: "/track" },
			{ label: "کدهای رهگیری روزانه", href: "/track#daily" },
			{ label: "سوالات متداول", href: "/faq" },
			{ label: "رزرو ۴ روزه", href: "/faq#reserve" },
			{ label: "شرایط ارسال", href: "/faq#shipping" },
			{ label: "بازگشت کالا", href: "/faq#return" },
		],
	},
];

/** A link is active on its own page and on any sub-route of it (home only matches exactly). */
export function isNavActive(pathname: string, href: string): boolean {
	return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
