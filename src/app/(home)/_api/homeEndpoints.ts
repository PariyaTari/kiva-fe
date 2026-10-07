import { httpClient, nextApiClient } from "@/httpClient/HttpClient";
import { Campaign, HomePage, TestimonialListResponse } from "../_types/home.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const HomeEndpoints = {
	/**
	 * Everything the home page shows, in one request — to this app's `/kiva-configs/home` (the project's copy + the
	 * catalog parts it reads from the backend), not the backend's `GET /home`.
	 */
	getHome: async () => {
		const res = await nextApiClient.call<HomePage>({ method: "GET", url: "home" });
		return res.data;
	},

	// ── backend parts of `/kiva-configs/home` (server side, `loadHomePage`) ──
	/** The running discount campaign with its countdown and top deals; `null` when there is none (`204`). */
	getActiveCampaign: async () => {
		const res = await httpClient.call<Campaign | "">({ method: "GET", url: "campaigns/active" });
		return res.status === 204 || !res.data ? null : res.data;
	},

	/** Customers' messenger messages + the satisfaction summary. */
	getTestimonials: async (page: number, size: number) => {
		const res = await httpClient.call<TestimonialListResponse>({ method: "GET", url: "testimonials", params: { page, size } });
		return res.data;
	},
};
