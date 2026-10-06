import { httpClient } from "@/httpClient/HttpClient";
import { PaymentGatewayCode } from "@/types/order.type";
import { CheckoutContext, PaymentInit, PaymentResult, PlaceOrderPayload, PlaceOrderResponse } from "../_types/checkout.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const CheckoutEndpoints = {
	/** `addressId` re-prices for that address (joining a reserved order is per address). */
	getContext: async (addressId?: number | null) => {
		const res = await httpClient.call<CheckoutContext>({ method: "GET", url: "checkout", params: { addressId } });
		return res.data;
	},

	/** The same `Idempotency-Key` for a resend of the same body — a lost response never places two orders. */
	placeOrder: async (payload: PlaceOrderPayload, idempotencyKey: string) => {
		const res = await httpClient.call<PlaceOrderResponse>({ method: "POST", url: "orders", data: payload, headers: { "Idempotency-Key": idempotencyKey } });
		return res.data;
	},

	getPayment: async (paymentId: string) => {
		const res = await httpClient.call<PaymentResult>({ method: "GET", url: `payments/${encodeURIComponent(paymentId)}` });
		return res.data;
	},

	retryPayment: async (paymentId: string, idempotencyKey: string, gateway?: PaymentGatewayCode) => {
		const res = await httpClient.call<PaymentInit>({
			method: "POST",
			url: `payments/${encodeURIComponent(paymentId)}/retry`,
			data: gateway ? { gateway } : {},
			headers: { "Idempotency-Key": idempotencyKey },
		});
		return res.data;
	},
};
