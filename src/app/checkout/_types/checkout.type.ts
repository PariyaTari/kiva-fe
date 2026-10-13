/** Mirrors the backend checkout / payment contract (kiva-openapi.yml · Checkout & Payment). */
import { Address, AddressInput } from "@/types/address.type";
import { Cart, CartReservation, ReservationConsolidation, ShippingMethodCode, ShippingOptionQuote } from "@/types/cart.type";
import { Money } from "@/types/catalog.type";
import {
	MessengerOption,
	OrderCode,
	OrderStatus,
	OrderSummary,
	PaymentGatewayCode,
	PaymentInit,
	PaymentStatus,
	PhotoMessengerChannel,
} from "@/types/order.type";

export interface PaymentGateway {
	code: PaymentGatewayCode;
	name: string;
	logoUrl?: string | null;
	brandColor?: string;
	/** Letter inside the fallback logo (`.bank`). */
	initial?: string;
	/** What checkout starts with — always one of the `available` ones (none when nothing is available). */
	isDefault?: boolean;
	/** Only these are accepted by `POST /orders`. */
	available?: boolean;
}

/** Everything the checkout page needs, in one request (`GET /checkout`). */
export interface CheckoutContext {
	cart: Cart;
	/** Default first, then the oldest. */
	addresses: Address[];
	/** The requested `addressId`, else the default; `null` when the shopper has no address → the new-address form opens. */
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
	/** The amount on the pay button — only compared (`409 PRICE_CHANGED` when it moved), never charged. Always send it. */
	expectedPayable?: Money;
	acceptTerms: boolean;
}

export interface PlaceOrderResponse {
	order: OrderSummary;
	/** `null` when nothing is left to pay (a full discount) — the order is already paid. */
	payment: PaymentInit | null;
}

/** `GET /payments/{id}` — what the result page shows after the bank sends the shopper back. */
export interface PaymentResult {
	paymentId: string;
	/** `PENDING` on the result page = verify is still running — ask again every 3 s, for at most 30 s. */
	status: PaymentStatus;
	amount: Money;
	gateway: PaymentGatewayCode;
	referenceId?: string | null;
	cardMask?: string | null;
	paidAt?: string | null;
	/** Failed attempts only — `null` for `SUCCEEDED` / `PENDING`. */
	failureReason?: string | null;
	/** Not paid, not being verified, and the order is still inside its payment window. */
	canRetry?: boolean;
	order?: {
		code: OrderCode;
		status?: OrderStatus;
		reserved?: boolean;
		consolidatedInto?: OrderCode | null;
	};
	/** The three steps of the success modal — only for `SUCCEEDED`, empty otherwise. */
	nextSteps?: string[];
}
