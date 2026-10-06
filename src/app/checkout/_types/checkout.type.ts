/** Mirrors the backend checkout / payment contract (kiva-openapi.yml · Checkout & Payment). */
import { Address, AddressInput } from "@/types/address.type";
import { Cart, CartReservation, ReservationConsolidation, ShippingMethodCode, ShippingOptionQuote } from "@/types/cart.type";
import { Money } from "@/types/catalog.type";
import { MessengerOption, OrderCode, OrderStatus, OrderSummary, PaymentGatewayCode, PaymentStatus, PhotoMessengerChannel } from "@/types/order.type";

export interface PaymentGateway {
	code: PaymentGatewayCode;
	name: string;
	logoUrl?: string | null;
	brandColor?: string;
	/** Letter inside the fallback logo (`.bank`). */
	initial?: string;
	isDefault?: boolean;
	available?: boolean;
}

/** Everything the checkout page needs, in one request (`GET /checkout`). */
export interface CheckoutContext {
	cart: Cart;
	addresses: Address[];
	selectedAddressId?: number | null;
	messengers: MessengerOption[];
	/** Profile default or the last choice. */
	selectedMessenger?: PhotoMessengerChannel | null;
	/** Last number used, or the account's mobile. */
	messengerPhone?: string;
	shippingOptions: ShippingOptionQuote[];
	reservation?: CartReservation;
	consolidation?: ReservationConsolidation | null;
	paymentGateways: PaymentGateway[];
	giftWrap?: { available?: boolean; price?: Money };
	termsUrl?: string;
}

export interface PreShipmentMessengerInput {
	channel: PhotoMessengerChannel;
	phone: string;
	username?: string | null;
	note?: string | null;
	saveAsDefault?: boolean;
}

/** Exactly one of `addressId` / `newAddress`. */
export interface PlaceOrderPayload {
	addressId?: number | null;
	newAddress?: AddressInput | null;
	saveNewAddress?: boolean;
	preShipmentMessenger: PreShipmentMessengerInput;
	shippingMethod: ShippingMethodCode;
	reserve?: boolean | null;
	paymentGateway: PaymentGatewayCode;
	/** The amount on the pay button — the server answers `409 PRICE_CHANGED` when it moved. */
	expectedPayable?: Money;
	acceptTerms: boolean;
}

/** How to leave for the bank: GET → just `url`; POST (Saman/Mellat) → an auto-submitted form with `fields`. */
export interface PaymentRedirect {
	url: string;
	method: "GET" | "POST";
	fields?: Record<string, string>;
}

export interface PaymentInit {
	paymentId: string;
	gateway: PaymentGatewayCode;
	amount: Money;
	redirect: PaymentRedirect;
	/** End of the temporary stock hold. */
	expiresAt?: string;
}

export interface PlaceOrderResponse {
	order: OrderSummary;
	/** `null` when nothing is left to pay (a full discount) — the order is already paid. */
	payment: PaymentInit | null;
}

/** `GET /payments/{id}` — what the result page shows after the bank sends the shopper back. */
export interface PaymentResult {
	paymentId: string;
	status: PaymentStatus;
	amount: Money;
	gateway: PaymentGatewayCode;
	referenceId?: string | null;
	cardMask?: string | null;
	paidAt?: string | null;
	failureReason?: string | null;
	canRetry?: boolean;
	order?: {
		code: OrderCode;
		status?: OrderStatus;
		reserved?: boolean;
		consolidatedInto?: OrderCode | null;
	};
	/** The three steps of the success modal. */
	nextSteps?: string[];
}
