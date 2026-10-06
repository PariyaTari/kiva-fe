import { httpClient } from "@/httpClient/HttpClient";
import { Address, AddressInput } from "@/types/address.type";
import { OrderCode, OrderDetail } from "@/types/order.type";
import { User } from "@/types/user.type";
import { AccountDashboard, MyReviewListResponse, OrderListFilter, OrderListResponse, TrackingDayGroup, UpdateProfilePayload } from "../_types/account.type";

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
		const res = await httpClient.call<OrderDetail>({ method: "GET", url: `me/orders/${encodeURIComponent(code)}` });
		return res.data;
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
