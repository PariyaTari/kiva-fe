import "../_styles/product.css";
import type { Metadata } from "next";
import ProductView from "../_components/productView/productView";

export const metadata: Metadata = {
	title: "محصول",
};

type ProductPageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ color?: string | string[] }>;
};

/** Product page — design `product.html` (`/product/mahak-shoulder-bag?color=lilac`; id and `KV-…` code work too). */
export default async function ProductPage({ params, searchParams }: ProductPageProps) {
	const { slug } = await params;
	const { color } = await searchParams;

	return (
		<div className="pg-product">
			<ProductView key={slug} slug={decodeURIComponent(slug)} initialColor={typeof color === "string" ? color : undefined} />
		</div>
	);
}
