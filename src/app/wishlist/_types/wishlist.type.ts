/** Mirrors the backend wishlist contract (kiva-openapi.yml · Wishlist). */
import { Cart } from "@/types/cart.type";
import { ColorKey, Money, ProductSummary } from "@/types/catalog.type";
import { PageMeta } from "@/types/pageinate";

export interface WishlistItem {
	product: ProductSummary;
	addedAt: string;
	preferredColorKey?: ColorKey | null;
	priceAtAdd?: Money;
	/** «از وقتی ذخیره کردی ۱۵٪ ارزون‌تر شده». */
	priceDrop?: { amount: Money; percent: number; label: string } | null;
}

export interface WishlistShare {
	token: string;
	url: string;
	createdAt?: string;
}

export interface Wishlist {
	items: WishlistItem[];
	meta: PageMeta;
	count: number;
	/** For «افزودن همه موجودها به سبد (۲)». */
	inStockCount: number;
	share?: WishlistShare | null;
}

export interface WishlistIds {
	productIds: number[];
	count: number;
}

export interface WishlistToggleResponse {
	productId: number;
	wishlisted: boolean;
	count: number;
	message: string;
}

export interface WishlistAddToCartResponse {
	cart: Cart;
	addedCount: number;
	skipped: { productId: number; name: string; reason: "OUT_OF_STOCK" | "UNAVAILABLE" | "ALREADY_AT_MAX" }[];
	message: string;
}
