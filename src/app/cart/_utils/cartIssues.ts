import { toast } from "@/store/notification.store";
import { Cart, CartMutationResponse } from "@/types/cart.type";

/** Carts whose issues were already shown — one response object can reach more than one caller. */
const shown = new WeakSet<Cart>();

/**
 * `Cart.issues` come **once** (contract 1.7.0): the request that returns them — the header's `GET /cart`, a cart
 * mutation, `GET /checkout`, the login that merged the guest cart — marks them seen, and the next read is clean.
 * So every place that gets a cart back shows them, or the shopper never hears that a bag sold out or a code was removed.
 */
export function announceCartIssues(cart: Cart | null | undefined) {
	if (!cart?.issues?.length || shown.has(cart)) return;
	shown.add(cart);
	cart.issues.forEach((issue) => toast(issue.message, { icon: issue.code === "DISCOUNT_REMOVED" ? "tag" : "info", type: "warning", duration: 5000 }));
}

/** An add that found no room (the product's cap is full in the cart): no `message`, and `cart.issues` says why. */
export const nothingAdded = (res: CartMutationResponse) => !res.message && !!res.cart.issues?.some((i) => i.code === "QUANTITY_REDUCED");

/** Rows that can't be bought right now (sold out / left the store) — `POST /orders` is refused while one is in the cart. */
export const unpurchasableItems = (cart: Cart | null | undefined) => cart?.items.filter((i) => i.purchasable === false) ?? [];
