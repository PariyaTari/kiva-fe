import { CLIENT_BUG, ErrorBehaviourMap, FINAL, REREAD, TRANSPORT } from "@/utils/apiError";

/** Wishlist (page, hearts, account panel). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	UNAUTHORIZED: REREAD, // session ended — the page re-renders as a guest
	TOKEN_EXPIRED: REREAD,
	PRODUCT_NOT_FOUND: REREAD, // removed from the catalogue while listed
	WISHLIST_LIMIT_REACHED: FINAL,
	VALIDATION_ERROR: CLIENT_BUG,
};
