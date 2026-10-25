import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, REREAD, TRANSPORT } from "@/utils/apiError";

/** Account (dashboard, orders, order actions, return page, tracking, addresses, reviews, profile). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	UNAUTHORIZED: REREAD, // session ended — the shell sends the shopper to login
	TOKEN_EXPIRED: REREAD,
	ORDER_NOT_FOUND: REREAD, // gone from the list since it was drawn
	ADDRESS_NOT_FOUND: REREAD,
	STOCK_ALERT_NOT_FOUND: REREAD, // cancelled meanwhile (another tab)
	PRODUCT_NOT_FOUND: FINAL, // change request: the bag left the catalogue
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
	CHANGED_BY_SOMEONE_ELSE: REREAD,
};

/*
 * Order-action answers — the order moved on while the card was on screen. They are an answer for the
 * modal / page (its own view + a re-read of the orders), not a failure toast.
 */
export const isOrderAlreadyPaidError = (e: ResultError | null | undefined) => e?.code === "ORDER_ALREADY_PAID";
export const isPaymentExpiredError = (e: ResultError | null | undefined) => e?.code === "PAYMENT_EXPIRED";
export const isGatewayUnavailableError = (e: ResultError | null | undefined) => e?.code === "PAYMENT_GATEWAY_UNAVAILABLE";
/**
 * The order's state changed meanwhile (photos sent, shipped, another request open, answered in another tab) — «دیگه نمی‌شه لغوش /
 * تغییرش داد»; `INVALID_STATUS_TRANSITION` = «همونه!» on photos that no longer wait for an answer.
 */
export const isOrderMovedOnError = (e: ResultError | null | undefined) =>
	e?.code === "ORDER_NOT_CANCELLABLE" || e?.code === "CHANGE_REQUEST_NOT_ALLOWED" || e?.code === "INVALID_STATUS_TRANSITION";
/** A payment of the order is being verified right now — try again in a moment. */
export const isPaymentInProgressError = (e: ResultError | null | undefined) => e?.code === "PAYMENT_IN_PROGRESS";
/** Change request: the colour / model asked for can't be sold (`422 PRODUCT_UNAVAILABLE`) or doesn't fit the change (`400 DESIRED_VARIANT_INVALID`). */
export const isDesiredVariantError = (e: ResultError | null | undefined) =>
	e?.code === "PRODUCT_UNAVAILABLE" || !!e?.errorDetails?.some((d) => d.code === "DESIRED_VARIANT_INVALID");
/** Re-subscribing from «برگردون»: already on / back in stock meanwhile — an info toast, not an error (as on the product page). */
export const isStockAlertAnswer = (e: ResultError | null | undefined) => e?.code === "STOCK_ALERT_EXISTS" || e?.code === "PRODUCT_IN_STOCK";
/** `PATCH /me`: the profile was saved elsewhere meanwhile and nothing was stored — re-read it and start the form over. */
export const isChangedBySomeoneElseError = (e: ResultError | null | undefined) => e?.code === "CHANGED_BY_SOMEONE_ELSE";
/** Edit / delete of a review that was deleted (`REVIEW_NOT_FOUND`) or approved (`REVIEW_NOT_EDITABLE`) meanwhile — re-read the list. */
export const isReviewMovedOnError = (e: ResultError | null | undefined) => e?.code === "REVIEW_NOT_FOUND" || e?.code === "REVIEW_NOT_EDITABLE";
/** «رسید خرید» of an order that was never paid — no retry. */
export const isInvoiceNotAvailableError = (e: ResultError | null | undefined) => e?.code === "INVOICE_NOT_AVAILABLE";
/** The return page's closed state. */
export const isNotReturnableError = (e: ResultError | null | undefined) => e?.code === "ORDER_NOT_RETURNABLE" || e?.code === "RETURN_WINDOW_EXPIRED";
