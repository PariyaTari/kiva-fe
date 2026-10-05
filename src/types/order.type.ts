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
	invoiceUrl?: string | null;
}
