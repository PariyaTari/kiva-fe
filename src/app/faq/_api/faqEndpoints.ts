import { httpClient } from "@/httpClient/HttpClient";
import { FaqResponse } from "../_types/faq.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const FaqEndpoints = {
	/** With `q` only matching questions come back, highlighted. Re-requested while typing — takes the query's `signal`. */
	getFaq: async (q: string, signal?: AbortSignal) => {
		const res = await httpClient.call<FaqResponse>({ method: "GET", url: "faq", params: { q }, signal });
		return res.data;
	},
};
