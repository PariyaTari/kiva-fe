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
	/** The account's mobile, `0912***6789` — the SMS goes to whatever number the account has when it is sent. */
	phoneMasked?: string;
	status: StockAlertStatus;
	createdAt?: string;
	notifiedAt?: string | null;
	/** Per status: «هر وقت موجود شد، بهت پیامک می‌دیم» / «موجود شد و بهت خبر دادیم» / «اشتراک لغو شد». */
	message?: string;
}

/** Signed-in only since 1.21.0 — no phone of its own; one `ACTIVE` alert per (product, colour or «any colour»), at most 30. */
export interface CreateStockAlertPayload {
	/** An active colour of the product that is out of stock; without it the alert fires for any colour. */
	variantId?: number | null;
}
