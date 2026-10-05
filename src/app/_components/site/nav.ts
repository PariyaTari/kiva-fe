import { IconName } from "@/app/_components/icon/icon.types";

export type NavItem = {
	label: string;
	href: string;
	/** `kv-drop` with the mega menu (design: «فروشگاه»). */
	mega?: boolean;
	icon?: IconName;
};

/** Main menu — design `NAV`. */
export const MAIN_NAV: NavItem[] = [
	{ label: "خانه", href: "/" },
	{ label: "فروشگاه", href: "/products", mega: true },
	{ label: "بلاگ", href: "/blog" },
	{ label: "درباره ما", href: "/about" },
	{ label: "تماس با ما", href: "/contact" },
];

/** Extra links at the end of the mobile drawer. */
export const MOBILE_EXTRA_NAV: NavItem[] = [
	{ label: "علاقه‌مندی‌ها", href: "/wishlist" },
	{ label: "حساب کاربری", href: "/account" },
	{ label: "پیگیری سفارش", href: "/track" },
	{ label: "سوالات متداول", href: "/faq" },
];

/** Active on its own page and on sub-routes; «فروشگاه» also covers product pages (design: `page === 'product'`). */
export function isNavActive(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/";
	if (href === "/products") return pathname.startsWith("/products") || pathname.startsWith("/product/");
	return pathname === href || pathname.startsWith(`${href}/`);
}
