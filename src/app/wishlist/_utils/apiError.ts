import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, isRouteNotFound, REREAD, TRANSPORT } from "@/utils/apiError";

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
	RATE_LIMITED: TRANSPORT, // shared list: 30 requests a minute per connection
};

/** A shared link that is malformed, revoked, unknown or switched off — one `404 NOT_FOUND`: the page says so, no ticket button. */
export const isSharedListGoneError = (e: ResultError | null | undefined) => e?.code === "NOT_FOUND" && !isRouteNotFound(e);
/** «کپی لینک لیست»: sharing is switched off (`wishlistShare` flag) — the box is hidden, not an error. */
export const isShareDisabledError = (e: ResultError | null | undefined) => e?.code === "WISHLIST_SHARE_DISABLED";
