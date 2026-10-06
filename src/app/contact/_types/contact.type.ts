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
	phone: string;
	email?: string | null;
	orderCode?: string | null;
	message: string;
}

export interface ContactMessageResponse {
	/** `CT-4821`. */
	ticketCode: string;
	createdAt?: string;
	message?: string;
}
