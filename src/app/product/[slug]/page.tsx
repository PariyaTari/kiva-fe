import "../_styles/product.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/_components/common/jsonLd/jsonLd";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { safeDecode } from "@/utils/route";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, plainText } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../_api/productEndpoints";
import ProductView from "../_components/productView/productView";
import { ProductDetail } from "../_types/product.type";
import { productJsonLd } from "../_utils/productJsonLd";

type ProductPageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string | string[] }>;
};

/**
 * Server prefetch for the HTML (as a guest) — same key as `ProductView`. A product that doesn't exist
 * is the site's 404 with a real 404 status (the client view only covers client-side navigation).
 */
async function loadProduct(slug: string) {
	const client = getServerQueryClient();
	const queryKey = ["product", "detail", slug];
	await client.prefetchQuery({ queryKey, queryFn: () => withMappedError(() => ProductEndpoints.getProduct(slug)) });
	if (client.getQueryState(queryKey)?.error?.statusCode === 404) notFound();
	return { client, product: client.getQueryData<ProductDetail>(queryKey) };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { product } = await loadProduct(safeDecode((await params).slug));
	// API down: a plain title; the browser still loads the product
	if (!product) return { title: "محصول" };
	return pageMetadata({
		seo: product.seo,
		title: product.name,
		description: product.shortDescription || plainText(product.description),
		// by id or `KV-…` code too — the canonical is always the slug
		path: `/product/${product.slug}`,
		image: product.image?.url,
	});
}

/** Product page — design `product.html` (`/product/mahak-shoulder-bag?color=lilac`; id and `KV-…` code work too). */
export default async function ProductPage({ params, searchParams }: ProductPageProps) {
	const slug = safeDecode((await params).slug);
	const { color } = await searchParams;
	const { client, product } = await loadProduct(slug);
	const url = product ? (product.seo?.canonicalUrl ?? absoluteUrl(`/product/${product.slug}`)) : null;

	return (
		<div className="pg-product">
			{product && url && <JsonLd data={[product.seo?.jsonLd ?? productJsonLd(product, url), breadcrumbJsonLd(product.breadcrumbs, url)]} />}
			<PrefetchBoundary client={client}>
				<ProductView key={slug} slug={slug} initialColor={typeof color === "string" ? color : undefined} />
			</PrefetchBoundary>
		</div>
	);
}
