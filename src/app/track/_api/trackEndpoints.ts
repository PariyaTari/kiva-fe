import { httpClient } from "@/httpClient/HttpClient";
import { DailyShipmentDay, DailyShipmentList, GuestTrackingPayload, GuestTrackingResult } from "../_types/track.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). Public — no login needed. */
export const TrackEndpoints = {
	/** The mobile goes in the body, never in the URL (privacy). */
	lookup: async (payload: GuestTrackingPayload) => {
		const res = await httpClient.call<GuestTrackingResult>({ method: "POST", url: "tracking/lookup", data: payload });
		return res.data;
	},

	getDays: async (days = 10) => {
		const res = await httpClient.call<DailyShipmentDay[]>({ method: "GET", url: "tracking/daily/days", params: { days } });
		return res.data;
	},

	/** Re-requested on every (debounced) keystroke of the search box — takes the query's `signal`. */
	getDaily: async (date: string, q: string, signal?: AbortSignal) => {
		const res = await httpClient.call<DailyShipmentList>({ method: "GET", url: "tracking/daily", params: { date, q, size: 200 }, signal });
		return res.data;
	},
};
