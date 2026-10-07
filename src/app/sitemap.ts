import type { MetadataRoute } from "next";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { BlogEndpoints } from "@/app/blog/_api/blogEndpoints";
import { ProductsEndpoints } from "@/app/products/_api/productsEndpoints";
import { EMPTY_FILTERS } from "@/app/products/_utils/filters";
import { FALLBACK_CONFIG } from "@/config/site";
import { PageMeta } from "@/types/pageinate";
import { absoluteUrl } from "@/utils/seo";

// rebuilt at most hourly — new products and posts show up within the hour
export const revalidate = 3600;

/** The API's largest page (`size` ≤ 100) and a safety stop for a runaway `hasNext`. */
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
	{ path: "/", priority: 1, changeFrequency: "daily" },
	{ path: "/products", priority: 0.9, changeFrequency: "daily" },
	{ path: "/products?onSale=true", priority: 0.7, changeFrequency: "daily" },
	{ path: "/blog", priority: 0.6, changeFrequency: "weekly" },
	{ path: "/faq", priority: 0.5, changeFrequency: "monthly" },
	{ path: "/about", priority: 0.4, changeFrequency: "yearly" },
	{ path: "/contact", priority: 0.4, changeFrequency: "yearly" },
	{ path: "/track", priority: 0.3, changeFrequency: "yearly" },
];

/** Every page of a list endpoint. */
async function everyPage<T>(fetchPage: (page: number) => Promise<{ items: T[]; meta: PageMeta }>): Promise<T[]> {
	const items: T[] = [];
	for (let page = 1; page <= MAX_PAGES; page++) {
		const res = await fetchPage(page);
		items.push(...res.items);
		if (!res.meta.hasNext) break;
	}
	return items;
}

/** A source the API can't answer right now is left out — the rest of the sitemap still goes out. */
async function orEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
	try {
		return await load();
	} catch {
		return [];
	}
}

/** `/sitemap.xml` — fixed pages, categories, every product (with its picture) and every blog post. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [categories, products, posts] = await Promise.all([
		orEmpty(() => SiteEndpoints.listCategories()),
		orEmpty(() => everyPage((page) => ProductsEndpoints.listProducts({ ...EMPTY_FILTERS, sort: "newest", page, size: PAGE_SIZE, includeFacets: false }))),
		orEmpty(() => everyPage((page) => BlogEndpoints.getPosts({ q: "", page, size: PAGE_SIZE }))),
	]);
	// CMS pages linked from the footer (`/pages/terms`, …) — the API has no list of them
	const cmsPages = (FALLBACK_CONFIG.footerLinks ?? []).flatMap((g) => g.links.map((l) => l.url)).filter((url) => url.startsWith("/pages/"));

	return [
		...STATIC_ROUTES.map((r) => ({ url: absoluteUrl(r.path), priority: r.priority, changeFrequency: r.changeFrequency })),
		...categories.map((c) => ({ url: absoluteUrl(`/products?category=${encodeURIComponent(c.slug)}`), priority: 0.8, changeFrequency: "daily" as const })),
		...products.map((p) => ({
			url: absoluteUrl(`/product/${p.slug}`),
			priority: 0.8,
			changeFrequency: "weekly" as const,
			images: p.image?.url ? [absoluteUrl(p.image.url)] : undefined,
		})),
		...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.publishedAt, priority: 0.6, changeFrequency: "monthly" as const })),
		...cmsPages.map((path) => ({ url: absoluteUrl(path), priority: 0.2, changeFrequency: "yearly" as const })),
	];
}
