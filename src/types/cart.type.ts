/** Mirrors the backend cart contract (kiva-openapi.yml · Cart). */
import { CategoryRef, Color, IconName, MediaAsset, Money, StockInfo } from "./catalog.type";
import { OrderCode } from "./order.type";

export type ShippingMethodCode = "TIPAX" | "POST" | "COURIER";

export interface ShippingOptionQuote {
	method: ShippingMethodCode;
	name: string;
	description?: string;
	icon?: IconName;
	/** Base price — shown struck-through when the method is free. */
	baseCost?: Money;
	cost: Money;
	isFree: boolean;
	freeReason?: "THRESHOLD" | "RESERVATION_CONSOLIDATION" | "PROMO" | null;
	estimatedDelivery?: { minDays: number; maxDays: number; fromDate?: string; toDate?: string };
	available: boolean;
	unavailableReason?: string | null;
	selected?: boolean;
}

export interface CartItem {
	id: string;
	productId: number;
	variantId: number;
	product: {
		id: number;
		slug: string;
		sku?: string;
		name: string;
		category?: CategoryRef;
		url?: string;
	};
	color: Color;
	/** `null` until the colour has a photo — the row shows the bag illustration. */
	image?: MediaAsset | null;
	quantity: number;
	/**
	 * Cap of the + button = min(stock of this colour, the product's `maxPerOrder` − the other colours of it in the cart, 20).
	 * The purchase cap belongs to the product, not the colour (contract 1.7.0). `0` for a row that can't be bought.
	 */
	maxQuantity?: number;
	/**
	 * `false`: the colour sold out or left the store. The row stays (to see or remove) but counts in no total,
	 * and `POST /orders` is refused while it is in the cart.
	 */
	purchasable: boolean;
	unitPrice: Money;
	unitCompareAtPrice?: Money | null;
	lineTotal: Money;
	lineCompareAtTotal?: Money | null;
	lineDiscount?: Money;
	stock: StockInfo;
	isWishlisted?: boolean | null;
	addedAt?: string;
}

/**
 * What changed since the cart was last read — each one comes **once** (the read that returns it marks it seen).
 * `QUANTITY_REDUCED` with `currentValue = 0`: the row was removed (no room left under the product's cap).
 * `DISCOUNT_REMOVED`: the code stopped being valid and was taken off (`itemId = null`).
 */
export interface CartIssue {
	code: "OUT_OF_STOCK" | "QUANTITY_REDUCED" | "PRICE_INCREASED" | "PRICE_DECREASED" | "VARIANT_UNAVAILABLE" | "DISCOUNT_REMOVED" | "SHIPPING_METHOD_CHANGED";
	itemId?: string | null;
	message: string;
	previousValue?: number | null;
	currentValue?: number | null;
}

/**
 * `itemsCompareAtTotal` − `productDiscount` = `subtotal` − `codeDiscount` + `shippingCost` = `payable`.
 * The amounts count purchasable rows only; `itemsCount` / `linesCount` count every row (the badge shows what the cart shows).
 */
export interface CartTotals {
	itemsCount: number;
	linesCount?: number;
	itemsCompareAtTotal: Money;
	productDiscount: Money;
	subtotal: Money;
	codeDiscount: Money;
	shippingCost: Money;
	shippingIsFree?: boolean;
	payable: Money;
	totalSavings?: Money;
	currency: "IRT";
}

export interface FreeShippingProgress {
	threshold: Money;
	method: ShippingMethodCode;
	eligible: boolean;
	remaining: Money;
	progressPercent: number;
	message?: string;
}

export interface AppliedDiscount {
	code: string;
	label: string;
	type: "PERCENT" | "FIXED";
	value: number;
	amount: Money;
}

/** Why the «رزرو ۴ روزه» switch can't be turned on (only while `available = false`). */
export type ReservationUnavailableReason = "HAS_ACTIVE_RESERVATION" | "ITEM_NOT_RESERVABLE" | "RESERVATION_DISABLED";

/** The optional «رزرو ۴ روزه» switch beside the shipping method — off unless the shopper turns it on. */
export interface CartReservation {
	available: boolean;
	/** `HAS_ACTIVE_RESERVATION` → show the joining message (`consolidation`) instead of the switch. */
	unavailableReason?: ReservationUnavailableReason | null;
	enabled: boolean;
	holdDays: number;
	shipAfterDate?: string;
	timeline?: { title: string; text: string }[];
}

/** The shopper has an active reservation: an order to the same address joins its group and ships free. */
export interface ReservationConsolidation {
	reservedOrderCode: OrderCode;
	/** Fixed for the whole group — never extended. */
	expiresAt: string;
	/** Only orders to this address join. */
	addressId?: number;
	shippingWaived?: boolean;
	/** The group's method (the first order's); a joining order can't pick another. */
	shippingMethod?: ShippingMethodCode;
	message: string;
}

export interface Cart {
	id: string;
	isGuest?: boolean;
	items: CartItem[];
	totals: CartTotals;
	shippingMethod: ShippingMethodCode;
	shippingOptions: ShippingOptionQuote[];
	/** `null` when no active shipping method has free shipping. */
	freeShipping?: FreeShippingProgress | null;
	reservation: CartReservation;
	/** For the default address (the cart has none); always `null` for a guest. */
	consolidation?: ReservationConsolidation | null;
	discount?: AppliedDiscount | null;
	issues?: CartIssue[];
	checkoutRequiresLogin?: boolean;
	updatedAt?: string;
}

export interface CartMutationResponse {
	cart: Cart;
	affectedItemId?: string | null;
	/** What the «برگردون» (undo) button re-adds. */
	removedItem?: { variantId: number; quantity: number; name: string } | null;
	/** Toast after an add («… (۱ عدد) به سبد اضافه شد») or a remove; `null` for an update, and for an add that found no room (`cart.issues` says why). */
	message?: string | null;
}

export interface AddCartItemPayload {
	variantId: number;
	quantity?: number;
}

export interface UpdateCartItemPayload {
	quantity?: number;
	variantId?: number;
}
