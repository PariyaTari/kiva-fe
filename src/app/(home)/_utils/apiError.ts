import { CLIENT_BUG, ErrorBehaviourMap, FINAL, TRANSPORT } from "@/utils/apiError";

/** Home page. `GET /home` is public and parameterless — every backend failure is either transport or unknown. */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	RATE_LIMITED: TRANSPORT,
};
