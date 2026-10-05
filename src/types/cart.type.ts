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
	image?: MediaAsset;
	quantity: number;
	/** Cap of the + button (variant stock). */
	maxQuantity?: number;
	unitPrice: Money;
	unitCompareAtPrice?: Money | null;
	lineTotal: Money;
	lineCompareAtTotal?: Money | null;
	lineDiscount?: Money;
	stock: StockInfo;
	isWishlisted?: boolean | null;
	addedAt?: string;
}

export interface CartIssue {
	code: "OUT_OF_STOCK" | "QUANTITY_REDUCED" | "PRICE_INCREASED" | "PRICE_DECREASED" | "VARIANT_UNAVAILABLE" | "DISCOUNT_REMOVED" | "SHIPPING_METHOD_CHANGED";
	itemId?: string | null;
	message: string;
	previousValue?: number | null;
	currentValue?: number | null;
}

/** `itemsCompareAtTotal` − `productDiscount` = `subtotal` − `codeDiscount` + `shippingCost` = `payable`. */
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

export interface CartReservation {
	available: boolean;
	enabled: boolean;
	holdDays: number;
	shipAfterDate?: string;
	timeline?: { title: string; text: string }[];
}

export interface ReservationConsolidation {
	reservedOrderCode: OrderCode;
	expiresAt: string;
	addressId?: number;
	shippingWaived?: boolean;
	message: string;
}

export interface Cart {
	id: string;
	isGuest?: boolean;
	items: CartItem[];
	totals: CartTotals;
	shippingMethod: ShippingMethodCode;
	shippingOptions: ShippingOptionQuote[];
	freeShipping?: FreeShippingProgress;
	reservation: CartReservation;
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
