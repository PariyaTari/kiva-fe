import { StockStatus } from "@/types/catalog.type";
import { absoluteUrl, plainText, SITE_NAME } from "@/utils/seo";
import { ProductDetail } from "../_types/product.type";

const AVAILABILITY: Record<StockStatus, string> = {
	IN_STOCK: "https://schema.org/InStock",
	LOW_STOCK: "https://schema.org/LimitedAvailability",
	OUT_OF_STOCK: "https://schema.org/OutOfStock",
};

/** Toman → Rial: schema.org wants an ISO 4217 currency and the Toman has none. */
const TOMAN_TO_RIAL = 10;

/**
 * schema.org `Product` for the product page — used when the API sends no `seo.jsonLd` of its own.
 * One `Offer` per colour (own SKU, price and stock), rating only when there are reviews.
 */
export function productJsonLd(product: ProductDetail, url: string) {
	const images = product.variants
		.flatMap((v) => v.media.filter((m) => m.type === "IMAGE").map((m) => m.url))
		.filter((src, i, all) => all.indexOf(src) === i)
		.slice(0, 8);
	const rating = product.ratingSummary;

	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		sku: product.sku,
		url,
		description: plainText(product.shortDescription || product.description, 500) || undefined,
		image: images.length ? images.map((src) => absoluteUrl(src)) : product.image?.url ? [absoluteUrl(product.image.url)] : undefined,
		brand: { "@type": "Brand", name: SITE_NAME },
		category: product.category?.name,
		offers: product.variants.map((v) => ({
			"@type": "Offer",
			sku: v.sku,
			name: `${product.name} — ${v.color.name}`,
			url: `${url}?color=${v.color.key}`,
			price: v.price.price * TOMAN_TO_RIAL,
			priceCurrency: "IRR",
			availability: AVAILABILITY[v.stock.status],
			itemCondition: "https://schema.org/NewCondition",
		})),
		aggregateRating:
			rating?.count > 0 ? { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count, bestRating: 5, worstRating: 1 } : undefined,
	};
}
