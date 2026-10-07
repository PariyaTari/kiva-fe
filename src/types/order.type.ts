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
	imageUrl?: string;
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
	canCancel?: boolean;
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
	id: number;
	productId: number;
	variantId: number;
	sku?: string;
	name: string;
	slug?: string;
	color: Color;
	image?: MediaAsset;
	quantity: number;
	unitPrice: Money;
	unitCompareAtPrice?: Money | null;
	lineTotal: Money;
	reviewed?: boolean;
	returnableUntil?: string | null;
}

export interface OrderTotals {
	itemsCompareAtTotal: Money;
	productDiscount: Money;
	subtotal: Money;
	discountCode?: string | null;
	codeDiscount: Money;
	shippingCost: Money;
	shippingFreeReason?: string | null;
	giftWrapCost?: Money;
	payable: Money;
	refunded?: Money;
	currency?: "IRT";
}

export interface AddressSnapshot {
	provinceName: string;
	cityName: string;
	addressLine: string;
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

export interface PreShipmentMedia {
	status: "WAITING" | "SENT" | "APPROVED" | "CHANGE_REQUESTED";
	channel: PhotoMessengerChannel;
	channelName: string;
	phone: string;
	note?: string | null;
	sentAt?: string | null;
	waitingMessage?: string | null;
	items: OrderMediaItem[];
	feedback?: { decision: "APPROVE" | "REQUEST_CHANGE"; note?: string | null; at: string } | null;
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
	/** End of the temporary stock hold. */
	expiresAt?: string;
}

export interface OrderPaymentInfo {
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
}

// ── order actions (account) ──

export type RefundMethod = "ORIGINAL_PAYMENT" | "BANK_TRANSFER" | "STORE_CREDIT";

export interface Refund {
	id: number;
	amount: Money;
	method: RefundMethod;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	reason?: string | null;
	expectedBy?: string | null;
	completedAt?: string | null;
	referenceId?: string | null;
}

export type CancelReason = "CHANGED_MIND" | "NOT_AS_PICTURED" | "ORDERED_BY_MISTAKE" | "FOUND_CHEAPER" | "DELIVERY_TOO_LONG" | "OTHER";

/** `POST /me/orders/{code}/cancel` — the reason is required. */
export interface CancelOrderPayload {
	reason: CancelReason;
	note?: string | null;
}

export interface CancelOrderResponse {
	order: OrderSummary;
	/** `null` when the order was never paid. */
	refund?: Refund | null;
	message?: string;
}

export type MediaChangeType = "COLOR" | "MODEL" | "CANCEL_ITEM" | "OTHER";

/** `POST /me/orders/{code}/media-feedback` — «همونه!» or a change request. */
export interface MediaFeedbackPayload {
	decision: "APPROVE" | "REQUEST_CHANGE";
	changeType?: MediaChangeType | null;
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
	refund?: Refund | null;
	createdAt: string;
	decidedAt?: string | null;
}
