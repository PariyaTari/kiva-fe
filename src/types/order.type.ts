/** Mirrors the backend order / payment contract (kiva-openapi.yml · Orders, Checkout & Payment). */
import { Color, ColorKey, IconName, MediaAsset, Money, Tone } from "./catalog.type";
import { ShippingMethodCode } from "./cart.type";

/** Public order code, e.g. `KV-218340`. */
export type OrderCode = string;

export type PhotoMessengerChannel = "RUBIKA" | "TELEGRAM" | "BALE";

export type SocialChannel = PhotoMessengerChannel | "INSTAGRAM";

export type PaymentGatewayCode = "ZARINPAL" | "SAMAN" | "MELLAT";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED";

export type OrderStatus =
	| "PENDING_PAYMENT"
	| "PAYMENT_FAILED"
	| "EXPIRED"
	| "RESERVED"
	| "PROCESSING"
	| "PHOTO_SENT"
	| "CHANGE_REQUESTED"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED"
	| "RETURN_REQUESTED"
	| "RETURNED"
	| "REFUNDED";

export interface MessengerOption {
	channel: PhotoMessengerChannel;
	name: string;
	hint?: string;
	iconUrl?: string | null;
	enabled?: boolean;
}

export interface OrderProgressStep {
	key: "PLACED" | "PHOTO_SENT" | "SHIPPED" | "DELIVERED";
	label: string;
	icon?: IconName;
	state: "DONE" | "CURRENT" | "UPCOMING";
	at?: string | null;
}

export interface OrderProgress {
	currentStepIndex: number;
	steps: OrderProgressStep[];
}

export interface ReservationInfo {
	/** Always `true` from `GET /me/reservation`; `false` on an order card = the hold ended and the order moves to `PROCESSING` shortly. */
	active: boolean;
	orderCode: OrderCode;
	startedAt?: string;
	expiresAt: string;
	remainingSeconds?: number;
	groupOrderCodes?: OrderCode[];
	message?: string;
}

export interface Shipment {
	carrier?: ShippingMethodCode;
	carrierName?: string;
	trackingCode?: string | null;
	trackingUrl?: string | null;
	shippedAt?: string | null;
	deliveredAt?: string | null;
	waitingMessage?: string | null;
}

export interface OrderItemPreview {
	productId: number;
	name: string;
	colorKey: ColorKey;
	/** `null` until the colour has a photo. */
	imageUrl?: string | null;
	quantity: number;
}

export interface PreShipmentMediaSummary {
	status: "WAITING" | "SENT" | "APPROVED" | "CHANGE_REQUESTED";
	channel: PhotoMessengerChannel;
	channelName: string;
	count: number;
	hasVideo?: boolean;
	sentAt?: string | null;
}

export interface OrderActions {
	/** The order's state hasn't changed yet: `RESERVED` / `PROCESSING` and no photo ever sent (contract 1.12.0); later — a change request or support. */
	canCancel?: boolean;
	/** `PHOTO_SENT` with the photos `SENT` or `APPROVED` (so after «همونه!» too), one open request at a time; never after shipping. */
	canRequestChange?: boolean;
	canApproveMedia?: boolean;
	canReturn?: boolean;
	canPay?: boolean;
	canAddToReservation?: boolean;
	canReview?: boolean;
}

/** Order card in «سفارش‌های من». */
export interface OrderSummary {
	code: OrderCode;
	placedAt: string;
	status: OrderStatus;
	statusLabel: string;
	statusTone?: Tone;
	payable: Money;
	/** Left to pay after a change to a pricier colour / model (`totals.balanceDue`); the order doesn't ship until it's 0. */
	balanceDue?: Money;
	shippingMethod: { code: ShippingMethodCode; name: string };
	itemsPreview: OrderItemPreview[];
	itemsCount?: number;
	progress: OrderProgress;
	reservation?: ReservationInfo | null;
	shipment?: Shipment;
	preShipmentMedia?: PreShipmentMediaSummary;
	actions?: OrderActions;
}

export interface OrderItem {
	/** Row number inside this order (1…n) — unique only within the order. */
	id: number;
	productId: number;
	variantId: number;
	sku?: string;
	name: string;
	slug?: string;
	color: Color;
	/** Photo URL of the colour at purchase time (the 480 size, a snapshot); `null` for a colour without a photo. */
	image?: string | null;
	quantity: number;
	unitPrice: Money;
	unitCompareAtPrice?: Money | null;
	lineTotal: Money;
	reviewed?: boolean;
	returnableUntil?: string | null;
}

/**
 * After a change request `itemsCompareAtTotal` / `productDiscount` / `subtotal` follow the current lines, `codeDiscount` loses the
 * share of a dropped line, and `shippingCost` stays as placed.
 */
export interface OrderTotals {
	itemsCompareAtTotal: Money;
	productDiscount: Money;
	subtotal: Money;
	discountCode?: string | null;
	codeDiscount: Money;
	shippingCost: Money;
	shippingFreeReason?: string | null;
	giftWrapCost?: Money;
	/** «پرداخت شده» — everything paid so far (the order + balances paid); for an unpaid order, what is to be paid. */
	payable: Money;
	/** Sum of the `COMPLETED` refunds. */
	refunded?: Money;
	/** See `OrderSummary.balanceDue`; a cancelled order has none. */
	balanceDue?: Money;
	currency?: "IRT";
}

export interface AddressSnapshot {
	provinceName: string;
	cityName: string;
	addressLine: string;
	plaque?: string | null;
	unit?: string | null;
	postalCode: string;
	recipientName: string;
	recipientPhone: string;
	fullText: string;
}

export interface OrderMediaItem extends MediaAsset {
	orderItemId?: number | null;
	view?: string;
	capturedAt?: string;
}

export type MediaChangeType = "COLOR" | "MODEL" | "CANCEL_ITEM" | "OTHER";

/** The operator's answer to a change request — the order goes back to `PROCESSING` and new photos follow. */
export interface ChangeResolution {
	decision: "APPLY" | "REJECT";
	/** The variant that was actually sent instead. */
	variantId?: number | null;
	/** For the shopper (the reason, for `REJECT`). */
	note?: string | null;
	at: string;
}

/** The shopper's latest answer to the photos; for `REQUEST_CHANGE` the request as it was sent. */
export interface MediaFeedback {
	decision: "APPROVE" | "REQUEST_CHANGE";
	changeType?: MediaChangeType | null;
	orderItemId?: number | null;
	/** Colour / model asked for instead. */
	desiredVariantId?: number | null;
	note?: string | null;
	at: string;
	/** `null` until the operator handles the request; stays until the new photos are answered. */
	resolution?: ChangeResolution | null;
}

export interface PreShipmentMedia {
	/** `CHANGE_REQUESTED` only until the operator handles it; then `WAITING` again (new photos). */
	status: "WAITING" | "SENT" | "APPROVED" | "CHANGE_REQUESTED";
	channel: PhotoMessengerChannel;
	channelName: string;
	phone: string;
	/** The shopper's id in that messenger, if given at checkout — the operator sends there. */
	username?: string | null;
	note?: string | null;
	sentAt?: string | null;
	waitingMessage?: string | null;
	/** Only the latest batch **sent** (the operator's draft never); empty before the first one. */
	items: OrderMediaItem[];
	feedback?: MediaFeedback | null;
	/** Photos sent + 24 h; without an answer by then they count as approved and the order may ship. */
	feedbackDeadline?: string | null;
}

export interface OrderEvent {
	status: OrderStatus;
	label: string;
	at: string;
	note?: string | null;
}

/** How to leave for the bank: GET → just `url`; POST (Saman/Mellat) → an auto-submitted form with `fields`. */
export interface PaymentRedirect {
	url: string;
	method: "GET" | "POST";
	fields?: Record<string, string>;
}

/** A new bank transaction (place order, retry, pay from the account). */
export interface PaymentInit {
	paymentId: string;
	gateway: PaymentGatewayCode;
	amount: Money;
	redirect: PaymentRedirect;
	/**
	 * End of the order's payment window (placed + 15 min) — the same for every attempt of the order, never extended.
	 * For a balance payment: the end of this attempt's window at the bank (start + 20 min); the balance itself has no deadline.
	 */
	expiresAt?: string;
}

export interface OrderPaymentInfo {
	/** `ORDER` the order itself; `BALANCE` a balance left by a change request. */
	purpose: "ORDER" | "BALANCE";
	/** Amount of this attempt. */
	amount: Money;
	gateway: PaymentGatewayCode;
	gatewayName: string;
	status: PaymentStatus;
	referenceId?: string | null;
	paidAt?: string | null;
	cardMask?: string | null;
}

export interface OrderDetail extends OrderSummary {
	items: OrderItem[];
	address: AddressSnapshot;
	totals: OrderTotals;
	payment?: OrderPaymentInfo;
	preShipmentMediaDetail?: PreShipmentMedia;
	timeline?: OrderEvent[];
	customerNote?: string | null;
	gift?: { wrap: boolean; message: string } | null;
	returns?: ReturnRequest[];
	invoiceUrl?: string | null;
	/** Every refund of the order (cancellation, change requests, returns), oldest first. */
	refunds?: Refund[];
}

// ── order actions (account) ──

/** `ORIGINAL_PAYMENT` back to the same card (a manual card-to-card), `BANK_TRANSFER` to an IBAN taken on the phone. */
export type RefundMethod = "ORIGINAL_PAYMENT" | "BANK_TRANSFER";

/**
 * Refunds are manual (contract 1.12.0): the server only records them — a colleague calls the shopper for the IBAN
 * (it is never stored) and transfers the money.
 */
export interface Refund {
	id: number;
	amount: Money;
	method: RefundMethod;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	reason?: string | null;
	/** The return request this refund is for. */
	returnId?: number | null;
	createdAt?: string;
	/** Created + 72 h — when the colleagues call, roughly. */
	expectedBy?: string | null;
	completedAt?: string | null;
	/** Tracking number of the bank transfer. */
	referenceId?: string | null;
	/** Note on the latest status change, written for the shopper (e.g. why it failed). */
	statusNote?: string | null;
}

export type CancelReason = "CHANGED_MIND" | "NOT_AS_PICTURED" | "ORDERED_BY_MISTAKE" | "FOUND_CHEAPER" | "DELIVERY_TOO_LONG" | "OTHER";

/** `POST /me/orders/{code}/cancel` — the reason is required. */
export interface CancelOrderPayload {
	reason: CancelReason;
	note?: string | null;
}

export interface CancelOrderResponse {
	order: OrderSummary;
	/** The `PENDING` refund of everything paid (manual — KIVA calls for the IBAN); `null` when nothing was paid. */
	refund?: Refund | null;
	message?: string;
}

/**
 * `POST /me/orders/{code}/media-feedback` — «همونه!» or a change request. `COLOR` / `MODEL` need `orderItemId` + `desiredVariantId`
 * (`COLOR` another colour of the same bag, `MODEL` a colour of another bag), `CANCEL_ITEM` `orderItemId` (the only line = the whole
 * order is cancelled once the operator applies it), `OTHER` a `note`.
 */
export interface MediaFeedbackPayload {
	decision: "APPROVE" | "REQUEST_CHANGE";
	changeType?: MediaChangeType | null;
	/** `OrderItem.id`. */
	orderItemId?: number | null;
	/** Colour / model to send instead. */
	desiredVariantId?: number | null;
	note?: string | null;
}

export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PICKUP_SCHEDULED" | "RECEIVED" | "REFUNDED" | "CLOSED";

/** The first four are KIVA's fault — KIVA pays the return shipping. */
export type ReturnReason = "NOT_AS_PICTURED" | "MANUFACTURING_DEFECT" | "WRONG_ITEM" | "DAMAGED_IN_TRANSIT" | "CHANGED_MIND" | "OTHER";

export interface CreateReturnPayload {
	items: { orderItemId: number; quantity: number }[];
	reason: ReturnReason;
	description?: string;
	/** Ids from `POST /me/uploads` (max 6). */
	mediaIds?: string[];
	refundMethod?: RefundMethod;
	/** Only for `BANK_TRANSFER`: `IR` + 24 digits. */
	iban?: string | null;
}

export interface ReturnRequest {
	id: number;
	/** `RT-1012`. */
	code: string;
	orderCode: OrderCode;
	status: ReturnStatus;
	statusLabel: string;
	reason: ReturnReason;
	description?: string | null;
	items: { orderItemId: number; name: string; color: Color; quantity: number }[];
	media?: MediaAsset[];
	shippingPaidBy?: "KIVA" | "CUSTOMER";
	instructions?: string | null;
	refundMethod?: RefundMethod;
	/** Only for `REJECTED`. */
	rejectionReason?: string | null;
	/** KIVA collects the parcel (`PICKUP_SCHEDULED`); `null` when the shopper sends it. */
	pickup?: ReturnPickup | null;
	refund?: Refund | null;
	createdAt: string;
	decidedAt?: string | null;
	receivedAt?: string | null;
	closedAt?: string | null;
	/** Only for `CLOSED` (ended without a refund). */
	closeReason?: string | null;
}

export interface ReturnPickup {
	carrier?: ShippingMethodCode;
	carrierName?: string;
	scheduledFor?: string | null;
	trackingCode?: string | null;
	note?: string | null;
}
