import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, REREAD, TRANSPORT } from "@/utils/apiError";

/** Product page (detail, related, inquiry, reviews). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	PRODUCT_NOT_FOUND: FINAL, // the page renders the 404 design instead
	VARIANT_NOT_FOUND: REREAD,
	COLOR_NOT_FOUND: REREAD, // inquiry: the picked colour was switched off meanwhile
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
};

/** Answers of the stock-alert button — shown as an info toast, not as an error. */
export const STOCK_ALERT_ANSWERS = ["STOCK_ALERT_EXISTS", "PRODUCT_IN_STOCK"];

/**
 * Stock alert: the page is out of date — the colour is back in stock (`PRODUCT_IN_STOCK`), was switched off (`VARIANT_NOT_FOUND`
 * on `variantId`) or the bag left the shop. Re-reading turns the button into «افزودن به سبد» (or the 404).
 */
export const isStockAlertStaleError = (e: ResultError | null | undefined) =>
	e?.code === "PRODUCT_IN_STOCK" || e?.code === "PRODUCT_NOT_FOUND" || !!e?.errorDetails?.some((d) => d.code === "VARIANT_NOT_FOUND");
/** 30 alerts are already waiting (`meta.limit`) — the shopper has to drop one first. */
export const isStockAlertLimitError = (e: ResultError | null | undefined) => e?.code === "STOCK_ALERT_LIMIT_REACHED";
/** «ثبت نظر»: a live (pending or approved) review of this product exists already. */
export const isReviewExistsError = (e: ResultError | null | undefined) => e?.code === "REVIEW_ALREADY_EXISTS";
