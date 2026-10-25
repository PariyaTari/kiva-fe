/** Mirrors the backend contact contract (kiva-openapi.yml · Content). */

export type ContactTopic = "ORDER_FOLLOWUP" | "PRODUCT_QUESTION" | "RETURN" | "COLLABORATION" | "OTHER";

export interface ContactTopicOption {
	value: ContactTopic;
	label: string;
	/** Show the optional «شماره سفارش» field. */
	requiresOrderCode?: boolean;
}

export interface ContactMessagePayload {
	topic: ContactTopic;
	fullName: string;
	/** `09…` (Persian digits are accepted too). */
	phone: string;
	email?: string | null;
	/** `KV-…`, a reference only — its owner isn't checked. */
	orderCode?: string | null;
	/** 10 to 600 characters, plain text. */
	message: string;
}

export interface ContactMessageResponse {
	/** `CT-` and 6 digits (`CT-482113`). */
	ticketCode: string;
	createdAt?: string;
	message?: string;
}
