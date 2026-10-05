import { CLIENT_BUG, ErrorBehaviourMap, FINAL, TRANSPORT } from "@/utils/apiError";

/** Shop listing. */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	VALIDATION_ERROR: CLIENT_BUG, // query params (sort, price, page size) are built by the FE
	RATE_LIMITED: TRANSPORT,
};
