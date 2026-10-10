import { httpClient } from "@/httpClient/HttpClient";
import { Address, AddressInput } from "@/types/address.type";
import { MediaAsset } from "@/types/catalog.type";
import {
	CancelOrderPayload,
	CancelOrderResponse,
	CreateReturnPayload,
	MediaFeedbackPayload,
	OrderCode,
	OrderDetail,
	PaymentGatewayCode,
	PaymentInit,
	PreShipmentMedia,
	ReturnRequest,
} from "@/types/order.type";
import { StockAlert } from "@/types/stockAlert.type";
import { PhoneChangeResponse, User } from "@/types/user.type";
import {
	AccountDashboard,
	MyReviewListResponse,
	OrderListFilter,
	OrderListResponse,
	PhoneChangeOtpResponse,
	PhoneChangePayload,
	ReorderResponse,
	TrackingDayGroup,
	UpdateProfilePayload,
	UploadPurpose,
} from "../_types/account.type";

const orderUrl = (code: OrderCode, rest = "") => `me/orders/${encodeURIComponent(code)}${rest}`;

/** Pure request functions — no React Query concepts live here (see data-fetching standard). All need a signed-in user. */
export const AccountEndpoints = {
	getMe: async () => {
		const res = await httpClient.call<User>({ method: "GET", url: "me" });
		return res.data;
	},

	updateMe: async (payload: UpdateProfilePayload) => {
		const res = await httpClient.call<User>({ method: "PATCH", url: "me", data: payload });
		return res.data;
	},

	/** Ownership of both numbers is proven: one code goes to the current number, one to the new one. */
	requestPhoneChange: async (newPhone: string) => {
		const res = await httpClient.call<PhoneChangeOtpResponse>({ method: "POST", url: "me/phone-change/request", data: { newPhone } });
		return res.data;
	},

	/** Ends every session and starts a new one for this device — the new session cookie needs `withCredentials`. */
	verifyPhoneChange: async (payload: PhoneChangePayload) => {
		const res = await httpClient.call<PhoneChangeResponse>({ method: "POST", url: "me/phone-change/verify", data: payload, withCredentials: true });
		return res.data;
	},

	getDashboard: async () => {
		const res = await httpClient.call<AccountDashboard>({ method: "GET", url: "me/dashboard" });
		return res.data;
	},

	// ── orders ──
	getOrders: async (filter: OrderListFilter, page: number, size: number) => {
		const res = await httpClient.call<OrderListResponse>({ method: "GET", url: "me/orders", params: { filter, page, size } });
		return res.data;
	},

	getOrder: async (code: OrderCode) => {
		const res = await httpClient.call<OrderDetail>({ method: "GET", url: orderUrl(code) });
		return res.data;
	},

	/** Pre-shipment photos with the answer deadline (`feedbackDeadline`) and the shopper's answer. */
	getOrderMedia: async (code: OrderCode) => {
		const res = await httpClient.call<PreShipmentMedia>({ method: "GET", url: orderUrl(code, "/media") });
		return res.data;
	},

	// ── order actions (shown by `OrderSummary.actions`) ──
	/** A new transaction for an unpaid order; the same `Idempotency-Key` for a resend of the same attempt. */
	payOrder: async (code: OrderCode, idempotencyKey: string, gateway: PaymentGatewayCode) => {
		const res = await httpClient.call<PaymentInit>({
			method: "POST",
			url: orderUrl(code, "/payments"),
			data: { gateway },
			headers: { "Idempotency-Key": idempotencyKey },
		});
		return res.data;
	},

	/** Puts the order's items that are still in stock back in the cart. */
	reorder: async (code: OrderCode) => {
		const res = await httpClient.call<ReorderResponse>({ method: "POST", url: orderUrl(code, "/reorder") });
		return res.data;
	},

	cancelOrder: async (code: OrderCode, payload: CancelOrderPayload) => {
		const res = await httpClient.call<CancelOrderResponse>({ method: "POST", url: orderUrl(code, "/cancel"), data: payload });
		return res.data;
	},

	sendMediaFeedback: async (code: OrderCode, payload: MediaFeedbackPayload) => {
		const res = await httpClient.call<OrderDetail>({ method: "POST", url: orderUrl(code, "/media-feedback"), data: payload });
		return res.data;
	},

	createReturn: async (code: OrderCode, payload: CreateReturnPayload) => {
		const res = await httpClient.call<ReturnRequest>({ method: "POST", url: orderUrl(code, "/returns"), data: payload });
		return res.data;
	},

	getReturns: async () => {
		const res = await httpClient.call<ReturnRequest[]>({ method: "GET", url: "me/returns" });
		return res.data;
	},

	/** The invoice PDF of a paid order. */
	downloadInvoice: async (code: OrderCode) => {
		// the PDF is rendered on demand — give it longer than an ordinary request
		const res = await httpClient.call<Blob>({ method: "GET", url: orderUrl(code, "/invoice"), responseType: "blob", timeout: 60_000 });
		return res.data;
	},

	/** Multipart upload (return evidence, review photos); `signal` lets a removed tile stop its upload. */
	uploadFile: async (file: File, purpose: UploadPurpose, onProgress?: (percent: number) => void, signal?: AbortSignal) => {
		const data = new FormData();
		data.append("file", file);
		data.append("purpose", purpose);
		// a 50MB video over a slow mobile link takes minutes; the tile shows progress and can cancel
		const res = await httpClient.call<MediaAsset>({ method: "POST", url: "me/uploads", data, onUploadProgress: onProgress, signal, timeout: 10 * 60_000 });
		return res.data;
	},

	// ── «موجود شد خبرم کن» ──
	getStockAlerts: async () => {
		const res = await httpClient.call<StockAlert[]>({ method: "GET", url: "me/stock-alerts" });
		return res.data;
	},

	deleteStockAlert: async (alertId: number) => {
		await httpClient.call<void>({ method: "DELETE", url: `me/stock-alerts/${alertId}` });
	},

	getTracking: async () => {
		const res = await httpClient.call<TrackingDayGroup[]>({ method: "GET", url: "me/tracking" });
		return res.data;
	},

	// ── reviews ──
	getReviews: async (page: number, size: number) => {
		const res = await httpClient.call<MyReviewListResponse>({ method: "GET", url: "me/reviews", params: { page, size } });
		return res.data;
	},

	// ── addresses (the default one first) ──
	getAddresses: async () => {
		const res = await httpClient.call<Address[]>({ method: "GET", url: "me/addresses" });
		return res.data;
	},

	createAddress: async (payload: AddressInput) => {
		const res = await httpClient.call<Address>({ method: "POST", url: "me/addresses", data: payload });
		return res.data;
	},

	/** Past orders keep their own snapshot of the address. */
	updateAddress: async (id: number, payload: AddressInput) => {
		const res = await httpClient.call<Address>({ method: "PUT", url: `me/addresses/${id}`, data: payload });
		return res.data;
	},

	deleteAddress: async (id: number) => {
		await httpClient.call<void>({ method: "DELETE", url: `me/addresses/${id}` });
	},

	setDefaultAddress: async (id: number) => {
		const res = await httpClient.call<Address[]>({ method: "POST", url: `me/addresses/${id}/default` });
		return res.data;
	},
};
