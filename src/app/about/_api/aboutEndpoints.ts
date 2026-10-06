import { httpClient } from "@/httpClient/HttpClient";
import { SiteStats } from "../_types/about.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const AboutEndpoints = {
	getStats: async () => {
		const res = await httpClient.call<SiteStats>({ method: "GET", url: "site/stats" });
		return res.data;
	},
};
