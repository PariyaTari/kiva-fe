import { CLIENT_BUG, ErrorBehaviourMap, FINAL, TRANSPORT } from "@/utils/apiError";

/** Site shell (config, categories, header search, newsletter). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	VALIDATION_ERROR: CLIENT_BUG, // search query / params are built by the FE
	RATE_LIMITED: TRANSPORT,
};
