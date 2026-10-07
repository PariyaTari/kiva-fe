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
	PRODUCT_NOT_FOUND: FINAL, // change request: the bag left the catalogue
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
};

/*
 * Order-action answers — the order moved on while the card was on screen. They are an answer for the
 * modal / page (its own view + a re-read of the orders), not a failure toast.
 */
export const isOrderAlreadyPaidError = (e: ResultError | null | undefined) => e?.code === "ORDER_ALREADY_PAID";
export const isPaymentExpiredError = (e: ResultError | null | undefined) => e?.code === "PAYMENT_EXPIRED";
export const isGatewayUnavailableError = (e: ResultError | null | undefined) => e?.code === "PAYMENT_GATEWAY_UNAVAILABLE";
/** Shipped meanwhile — «دیگه نمی‌شه لغوش / تغییرش داد». */
export const isTooLateError = (e: ResultError | null | undefined) => e?.code === "ORDER_NOT_CANCELLABLE" || e?.code === "CHANGE_REQUEST_NOT_ALLOWED";
/** The return page's closed state. */
export const isNotReturnableError = (e: ResultError | null | undefined) => e?.code === "ORDER_NOT_RETURNABLE" || e?.code === "RETURN_WINDOW_EXPIRED";
