import type { Metadata } from "next";
import { SITE_URL } from "@/config/global";
import { Breadcrumb, SeoMeta } from "@/types/catalog.type";

export const SITE_NAME = "کیوا";
export const SITE_LOCALE = "fa_IR";

/** `/product/x` → `https://…/product/x`; absolute URLs pass through. */
export function absoluteUrl(pathOrUrl: string): string {
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** API HTML → one plain line for a meta description, cut at `max` characters. */
export function plainText(html: string | null | undefined, max = 170): string {
	const text = (html ?? "")
		.replace(/<[^>]*>/g, " ")
		.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name])
		.replace(/\s+/g, " ")
		.trim();
	return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

type PageSeo = {
	/** The API's `seo` block — wins over the fallbacks below. */
	seo?: SeoMeta | null;
	/** Short title; the root layout's template adds « | کیوا». */
	title: string;
	description?: string | null;
	/** Path of this page — the canonical URL unless the API gives one. */
	path: string;
	image?: string | null;
	type?: "website" | "article";
};

/** `generateMetadata` result from the API's `seo` block with sane fallbacks. */
export function pageMetadata({ seo, title, description, path, image, type = "website" }: PageSeo): Metadata {
	const fullTitle = seo?.title || `${title} | ${SITE_NAME}`;
	const desc = seo?.description || description || undefined;
	const url = seo?.canonicalUrl || absoluteUrl(path);
	const ogImage = seo?.ogImageUrl || image || undefined;

	return {
		// the API's title already carries « | کیوا» — keep the layout template off it
		title: seo?.title ? { absolute: seo.title } : title,
		description: desc,
		alternates: { canonical: url },
		// a page's `openGraph` replaces the layout's whole object, so the site-wide fields are repeated here
		openGraph: {
			type,
			url,
			title: fullTitle,
			description: desc,
			siteName: SITE_NAME,
			locale: SITE_LOCALE,
			images: ogImage ? [{ url: ogImage }] : undefined,
		},
		twitter: { card: ogImage ? "summary_large_image" : "summary", title: fullTitle, description: desc, images: ogImage ? [ogImage] : undefined },
		robots: seo?.noIndex ? { index: false, follow: true } : undefined,
	};
}

/** schema.org `BreadcrumbList` from the API's breadcrumbs; the last crumb (no link) is this page. */
export function breadcrumbJsonLd(crumbs: Breadcrumb[], currentUrl: string) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map((c, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: c.label,
			item: absoluteUrl(c.url ?? currentUrl),
		})),
	};
}

/** Personal or one-off pages (account, cart, checkout, login, wishlists) — kept out of search results. */
export const NO_INDEX: Metadata["robots"] = { index: false, follow: true };
