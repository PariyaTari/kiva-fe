import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, REREAD, TRANSPORT } from "@/utils/apiError";

/** Checkout (context, place order) and the payment result page. */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	UNAUTHORIZED: REREAD, // session ended — the guard sends the shopper to login
	TOKEN_EXPIRED: REREAD,
	CART_NOT_FOUND: REREAD,
	PAYMENT_NOT_FOUND: FINAL, // a foreign / mistyped `paymentId` — the result page shows its «not found» state instead
	RESERVATION_UNAVAILABLE: REREAD,
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
};

/** `GET /checkout` on an empty cart — the page shows the design's empty state, not an error. */
export const isCartEmptyError = (error: ResultError | null | undefined) => error?.code === "CART_EMPTY";

/** `GET /payments/{id}`: not this shopper's / no such transaction — the result page's «not found» state, like a link without `paymentId`. */
export const isPaymentNotFoundError = (error: ResultError | null | undefined) => error?.code === "PAYMENT_NOT_FOUND";

/** `GET /checkout?addressId=` for an address that is gone (deleted in another tab) — `400` on `addressId` (`ADDRESS_NOT_FOUND`); fall back to the default. */
export const isAddressGoneError = (error: ResultError | null | undefined) =>
	error?.code === "VALIDATION_ERROR" && !!error.errorDetails?.some((d) => d.field === "addressId" && d.code === "ADDRESS_NOT_FOUND");

/** Place-order answers that point at a field of the form — shown inline, like the client-side checks. */
export const MESSENGER_CODES = ["MESSENGER_REQUIRED", "MESSENGER_PHONE_INVALID"];

/** Place-order answers after which the page data is stale — re-read the context so the shopper sees the new state. */
export const REREAD_CONTEXT_CODES = [
	"PRICE_CHANGED",
	"OUT_OF_STOCK",
	"PRODUCT_UNAVAILABLE",
	"QUANTITY_EXCEEDS_LIMIT",
	"CART_EMPTY",
	"ADDRESS_NOT_FOUND",
	"SHIPPING_METHOD_UNAVAILABLE",
	"PAYMENT_GATEWAY_UNAVAILABLE",
	"RESERVATION_UNAVAILABLE",
];

/** Place-order answers shown as a warning (the page re-reads and the shopper decides again), not as a failure. */
export const WARNING_CODES = ["PRICE_CHANGED", "RESERVATION_UNAVAILABLE", "OUT_OF_STOCK", "PRODUCT_UNAVAILABLE", "QUANTITY_EXCEEDS_LIMIT", "RATE_LIMITED"];
