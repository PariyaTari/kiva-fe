import { CLIENT_BUG, ErrorBehaviourMap, FINAL, REREAD, TRANSPORT } from "@/utils/apiError";

/** Cart (page, drawer, add-to-cart buttons). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	CART_NOT_FOUND: REREAD, // stale guest token — a re-read issues a fresh cart
	CART_ITEM_NOT_FOUND: REREAD, // the line was removed in another tab
	VARIANT_NOT_FOUND: REREAD,
	OUT_OF_STOCK: FINAL,
	PRODUCT_UNAVAILABLE: FINAL,
	QUANTITY_EXCEEDS_STOCK: FINAL,
	QUANTITY_EXCEEDS_LIMIT: FINAL,
	SHIPPING_METHOD_UNAVAILABLE: FINAL,
	VALIDATION_ERROR: CLIENT_BUG,
};

/** Discount-code failures are an answer for the form (inline message), not an error of the page. */
export const DISCOUNT_CODES = [
	"DISCOUNT_CODE_INVALID",
	"DISCOUNT_CODE_EXPIRED",
	"DISCOUNT_CODE_NOT_STARTED",
	"DISCOUNT_MIN_SUBTOTAL_NOT_MET",
	"DISCOUNT_FIRST_ORDER_ONLY",
	"DISCOUNT_USAGE_LIMIT_REACHED",
	"DISCOUNT_LOGIN_REQUIRED",
	"DISCOUNT_NOT_APPLICABLE",
	"VALIDATION_ERROR",
];
