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
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
};

/** Answers of the stock-alert button — shown as an info toast, not as an error. */
export const STOCK_ALERT_ANSWERS = ["STOCK_ALERT_EXISTS", "PRODUCT_IN_STOCK"];
