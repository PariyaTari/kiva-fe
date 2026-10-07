import { httpClient } from "@/httpClient/HttpClient";
import { StaticPage } from "../_types/staticPage.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const PagesEndpoints = {
	getPage: async (slug: string) => {
		const res = await httpClient.call<StaticPage>({ method: "GET", url: `pages/${encodeURIComponent(slug)}` });
		return res.data;
	},
};
