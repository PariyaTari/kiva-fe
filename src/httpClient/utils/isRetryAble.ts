/** Only transient failures are worth retrying; app/validation errors (backend `code`s) are not. */
export const isRetryAble = (code: string): boolean => {
	return ["SERVICE_UNAVAILABLE", "UNKNOWN_ERROR", "TIMEOUT", "NETWORK_ERROR", "NOT_FOUND"].includes(code);
};
