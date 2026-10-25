import { ReviewablePurchase, ReviewPurchaseRef } from "@/types/review.type";

/** The product page link of «نظر بده»: the bought colour, the purchase, and the reviews tab. */
export const reviewLink = (p: ReviewablePurchase) =>
	`/product/${encodeURIComponent(p.product.slug)}?color=${p.color.key}&order=${encodeURIComponent(p.orderCode)}&item=${p.orderItemId}#reviews`;

/** `?order=KV-…&item=2` of that link → the purchase to send with the review; anything malformed is dropped (the server links one itself). */
export function purchaseFromQuery(order: unknown, item: unknown): ReviewPurchaseRef | null {
	if (typeof order !== "string" || typeof item !== "string" || !/^KV-\d+$/i.test(order) || !/^\d+$/.test(item)) return null;
	return { orderCode: order.toUpperCase(), orderItemId: Number(item) };
}
