/**
 * Kiva success bodies are returned bare — no `{ success, data }` envelope — so an endpoint's
 * response type is its schema directly. These are the shared shapes around that contract.
 */

/** Body of action endpoints that only confirm with a display-ready message (`MessageResponse`). */
export type MessageResponse = {
	message: string;
};

/** One per-field validation failure inside a problem body (`FieldError`). */
export type ApiFieldError = {
	/** Dot-notation path of the field, e.g. `newAddress.postalCode`. */
	field: string;
	code: string;
	message: string;
};

/** RFC 7807 problem body every failed request returns (`application/problem+json`). */
export type ApiProblem = {
	type?: string;
	title?: string;
	status: number;
	/** Stable machine code (`ErrorCode` enum on the server), e.g. `DISCOUNT_MIN_SUBTOTAL_NOT_MET`. */
	code: string;
	/** Persian, user-facing message — safe to show as-is. */
	message: string;
	detail?: string;
	instance?: string;
	traceId?: string;
	errors?: ApiFieldError[];
	/** Error-specific data: `minSubtotal`, `availableQuantity`, `retryAfterSeconds`, ... */
	meta?: Record<string, unknown>;
};
