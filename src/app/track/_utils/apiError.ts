import { ResultError } from "@/types/result";
import { CLIENT_BUG, ErrorBehaviourMap, FINAL, TRANSPORT } from "@/utils/apiError";

/** Public tracking (lookup, daily codes). */
export const ERROR_BEHAVIOUR: ErrorBehaviourMap = {
	// FE-synthesized — fixed, always first
	NETWORK_ERROR: TRANSPORT,
	TIMEOUT: TRANSPORT,
	SERVICE_UNAVAILABLE: TRANSPORT,
	NOT_FOUND: CLIENT_BUG,
	NOT_DATA_FOUND: FINAL,

	// module codes
	VALIDATION_ERROR: CLIENT_BUG,
	RATE_LIMITED: TRANSPORT,
};

/** «سفارشی با این شماره و موبایل پیدا نکردیم» — an answer of the lookup, shown as the `.not-found` result. */
export const isTrackingNotFoundError = (error: ResultError | null | undefined) => error?.code === "TRACKING_NOT_FOUND";
