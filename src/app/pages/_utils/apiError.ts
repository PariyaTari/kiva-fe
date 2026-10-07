import { CLIENT_BUG, ErrorBehaviourMap, FINAL, TRANSPORT } from "@/utils/apiError";

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
