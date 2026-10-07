/** Mirrors the «موجود شد خبرم کن» contract (kiva-openapi.yml · `StockAlert`) — product page and the account panel share it. */
import { Color, ProductRef } from "./catalog.type";

/** `ACTIVE` waits for the stock; `NOTIFIED` — the SMS went out; `CANCELLED` — the shopper turned it off. */
export type StockAlertStatus = "ACTIVE" | "NOTIFIED" | "CANCELLED";

export interface StockAlert {
	id: number;
	product?: ProductRef;
	/** `null` → any colour coming back in stock. */
	variantId?: number | null;
	color?: Color | null;
	channel?: "SMS";
	/** `0912***6789`. */
	phoneMasked?: string;
	status: StockAlertStatus;
	createdAt?: string;
	notifiedAt?: string | null;
	/** «هر وقت موجود شد، بهت پیامک می‌دیم». */
	message?: string;
}

export interface CreateStockAlertPayload {
	/** Without it the alert fires for any colour. */
	variantId?: number | null;
	/** Required for guests. */
	phone?: string;
}
