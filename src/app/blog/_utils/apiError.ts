import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, isRouteNotFound, TRANSPORT } from "@/utils/apiError";

/** Blog (list, post, related). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	VALIDATION_ERROR: CLIENT_BUG,
};

/** A draft, archived, scheduled or unknown post — the backend's `404 NOT_FOUND` (with a message); the site's 404 page. */
export const isPostNotFoundError = (e: ResultError | null | undefined) => e?.code === "NOT_FOUND" && !isRouteNotFound(e);
