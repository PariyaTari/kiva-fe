import { httpClient } from "@/httpClient/HttpClient";
import { ColorKey, ProductSummary } from "@/types/catalog.type";
import { CreateReviewPayload, Review } from "@/types/review.type";
import { CreateStockAlertPayload, ProductDetail, ProductInquiry, ReviewListResponse, StockAlert } from "../_types/product.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const ProductEndpoints = {
	/** `idOrSlug`: digits → id, `KV-…` → product code, otherwise slug. */
	getProduct: async (idOrSlug: string) => {
		const res = await httpClient.call<ProductDetail>({ method: "GET", url: `products/${encodeURIComponent(idOrSlug)}` });
		return res.data;
	},

	getRelated: async (productId: number, limit = 8) => {
		const res = await httpClient.call<ProductSummary[]>({ method: "GET", url: `products/${productId}/related`, params: { limit } });
		return res.data;
	},

	createStockAlert: async (productId: number, payload: CreateStockAlertPayload) => {
		const res = await httpClient.call<StockAlert>({ method: "POST", url: `products/${productId}/stock-alerts`, data: payload });
		return res.data;
	},

	getInquiry: async (productId: number, color: ColorKey) => {
		const res = await httpClient.call<ProductInquiry>({ method: "GET", url: `products/${productId}/inquiry`, params: { color } });
		return res.data;
	},

	/** Approved reviews + rating summary; a signed-in user's pending ones come first (`isMine`). */
	listReviews: async (productId: number, params: { page: number; size: number }) => {
		const res = await httpClient.call<ReviewListResponse>({ method: "GET", url: `products/${productId}/reviews`, params });
		return res.data;
	},

	createReview: async (productId: number, payload: CreateReviewPayload) => {
		const res = await httpClient.call<Review>({ method: "POST", url: `products/${productId}/reviews`, data: payload });
		return res.data;
	},
};
