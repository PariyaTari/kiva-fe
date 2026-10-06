import { httpClient } from "@/httpClient/HttpClient";
import { ColorKey } from "@/types/catalog.type";
import { SharedWishlist, Wishlist, WishlistAddToCartResponse, WishlistIds, WishlistShare, WishlistToggleResponse } from "../_types/wishlist.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). All need a signed-in user. */
export const WishlistEndpoints = {
	getWishlist: async (page = 1, size = 48) => {
		const res = await httpClient.call<Wishlist>({ method: "GET", url: "me/wishlist", params: { page, size } });
		return res.data;
	},

	/** Ids only — lights up the hearts on cards and the header badge. */
	getIds: async () => {
		const res = await httpClient.call<WishlistIds>({ method: "GET", url: "me/wishlist/ids" });
		return res.data;
	},

	add: async (productId: number, colorKey?: ColorKey | null) => {
		const res = await httpClient.call<WishlistToggleResponse>({ method: "PUT", url: `me/wishlist/items/${productId}`, data: colorKey ? { colorKey } : {} });
		return res.data;
	},

	remove: async (productId: number) => {
		const res = await httpClient.call<WishlistToggleResponse>({ method: "DELETE", url: `me/wishlist/items/${productId}` });
		return res.data;
	},

	clear: async () => {
		await httpClient.call<void>({ method: "DELETE", url: "me/wishlist" });
	},

	/** Every in-stock item, one each, in its saved (or first available) colour. */
	addAllToCart: async () => {
		const res = await httpClient.call<WishlistAddToCartResponse>({ method: "POST", url: "me/wishlist/add-to-cart", data: {} });
		return res.data;
	},

	share: async () => {
		const res = await httpClient.call<WishlistShare>({ method: "POST", url: "me/wishlist/share" });
		return res.data;
	},

	/** Public — the page behind a shared link (`/wishlist/shared/{token}`). */
	getShared: async (token: string) => {
		const res = await httpClient.call<SharedWishlist>({ method: "GET", url: `wishlists/shared/${encodeURIComponent(token)}` });
		return res.data;
	},
};
