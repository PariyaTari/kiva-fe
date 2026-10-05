import { httpClient } from "@/httpClient/HttpClient";
import { AddCartItemPayload, Cart, CartMutationResponse, ShippingMethodCode, UpdateCartItemPayload } from "@/types/cart.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). Guest carts ride on `X-Cart-Token` (HttpClient). */
export const CartEndpoints = {
	getCart: async () => {
		const res = await httpClient.call<Cart>({ method: "GET", url: "cart" });
		return res.data;
	},

	clearCart: async () => {
		const res = await httpClient.call<Cart>({ method: "DELETE", url: "cart" });
		return res.data;
	},

	addItem: async (payload: AddCartItemPayload) => {
		const res = await httpClient.call<CartMutationResponse>({ method: "POST", url: "cart/items", data: payload });
		return res.data;
	},

	updateItem: async (itemId: string, payload: UpdateCartItemPayload) => {
		const res = await httpClient.call<CartMutationResponse>({ method: "PATCH", url: `cart/items/${itemId}`, data: payload });
		return res.data;
	},

	removeItem: async (itemId: string) => {
		const res = await httpClient.call<CartMutationResponse>({ method: "DELETE", url: `cart/items/${itemId}` });
		return res.data;
	},

	moveToWishlist: async (itemId: string) => {
		const res = await httpClient.call<CartMutationResponse>({ method: "POST", url: `cart/items/${itemId}/move-to-wishlist` });
		return res.data;
	},

	setShippingMethod: async (method: ShippingMethodCode) => {
		const res = await httpClient.call<Cart>({ method: "PUT", url: "cart/shipping-method", data: { method } });
		return res.data;
	},

	setReservation: async (enabled: boolean) => {
		const res = await httpClient.call<Cart>({ method: "PUT", url: "cart/reservation", data: { enabled } });
		return res.data;
	},

	applyDiscountCode: async (code: string) => {
		const res = await httpClient.call<Cart>({ method: "POST", url: "cart/discount-code", data: { code } });
		return res.data;
	},

	removeDiscountCode: async () => {
		const res = await httpClient.call<Cart>({ method: "DELETE", url: "cart/discount-code" });
		return res.data;
	},
};
