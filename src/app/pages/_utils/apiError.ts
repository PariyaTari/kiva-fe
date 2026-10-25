import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, isRouteNotFound, TRANSPORT } from "@/utils/apiError";

/** Static CMS pages (`/pages/{slug}`). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	PAGE_NOT_FOUND: FINAL, // the route renders the 404 design instead
};

/** A page the panel hasn't written (the contract's `404 NOT_FOUND`, the mock's `PAGE_NOT_FOUND`) — the site's 404 page. */
export const isPageNotFoundError = (e: ResultError | null | undefined) => e?.code === "PAGE_NOT_FOUND" || (e?.code === "NOT_FOUND" && !isRouteNotFound(e));
