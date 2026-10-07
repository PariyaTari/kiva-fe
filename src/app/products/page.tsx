import "./_styles/products.css";
import type { Metadata } from "next";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { pageMetadata } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { ProductsEndpoints } from "./_api/productsEndpoints";
import ProductsView from "./_components/productsView/productsView";
import { ProductListResponse } from "./_types/products.type";
import { canonicalSearch, PAGE_SIZE, parseFilters, SHOP_SUBTITLE } from "./_utils/filters";

type ProductsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** `?category=a&sort=…` exactly as the client reads it (`useSearchParams`). */
async function readFilters(searchParams: ProductsPageProps["searchParams"]) {
	const search = new URLSearchParams();
	Object.entries(await searchParams).forEach(([key, value]) => {
		if (typeof value === "string") search.set(key, value);
	});
	return parseFilters(search);
}

/** Server prefetch of the first grid page for the HTML — same key and request as `ProductsView`. */
async function loadList(searchParams: ProductsPageProps["searchParams"]) {
	const { filters, sort } = await readFilters(searchParams);
	const client = getServerQueryClient();
	const queryKey = ["products", "list", { ...filters, sort }];
	await client.prefetchQuery({
		queryKey,
		queryFn: () => withMappedError(() => ProductsEndpoints.listProducts({ ...filters, sort, page: 1, size: PAGE_SIZE, includeFacets: true })),
	});
	return { client, filters, list: client.getQueryData<ProductListResponse>(queryKey) };
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
	const { filters, list } = await loadList(searchParams);
	const metadata = pageMetadata({
		// «کیف دوشی» / «تخفیف‌خورده‌ها» / «فروشگاه کیوا»
		title: list?.title ?? "فروشگاه",
		description: list?.subtitle ?? SHOP_SUBTITLE,
		path: `/products${canonicalSearch(filters)}`,
	});
	// search results are not landing pages
	return filters.q ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

/** Shop — design `products.html`. */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
	const { client } = await loadList(searchParams);

	return (
		<div className="pg-products">
			<main>
				{/* no <Suspense> for useSearchParams: the page renders per request (it reads `searchParams`), and a
				    boundary would stream the grid in after the shell — crawlers should get it inline */}
				<PrefetchBoundary client={client}>
					<ProductsView />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
