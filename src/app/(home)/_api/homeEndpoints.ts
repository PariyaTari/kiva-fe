import { httpClient } from "@/httpClient/HttpClient";
import { HomePage } from "../_types/home.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const HomeEndpoints = {
	/** Everything the home page shows, in one aggregate request. */
	getHome: async () => {
		const res = await httpClient.call<HomePage>({ method: "GET", url: "home" });
		return res.data;
	},
};
