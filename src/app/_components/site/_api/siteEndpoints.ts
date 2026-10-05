import { httpClient } from "@/httpClient/HttpClient";
import { MessageResponse } from "@/types/apiResponse.type";
import { Category } from "@/types/catalog.type";
import { SiteConfig } from "@/types/siteConfig.type";
import { SearchHints, SearchSuggestResponse } from "../_types/site.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const SiteEndpoints = {
	/** Header/footer/drawer settings — announcements, shipping threshold, support, social, footer links. */
	getConfig: async () => {
		const res = await httpClient.call<SiteConfig>({ method: "GET", url: "config" });
		return res.data;
	},

	/** Mega menu, mobile menu, shop chips. */
	listCategories: async () => {
		const res = await httpClient.call<Category[]>({ method: "GET", url: "categories" });
		return res.data;
	},

	/** Live header search — typed, so it takes the RQ `signal`. */
	searchSuggest: async (q: string, signal?: AbortSignal) => {
		const res = await httpClient.call<SearchSuggestResponse>({ method: "GET", url: "search/suggest", params: { q, limit: 8 }, signal });
		return res.data;
	},

	getSearchHints: async () => {
		const res = await httpClient.call<SearchHints>({ method: "GET", url: "search/hints" });
		return res.data;
	},

	subscribeNewsletter: async (email: string) => {
		const res = await httpClient.call<MessageResponse>({ method: "POST", url: "newsletter/subscriptions", data: { email, source: "footer" } });
		return res.data;
	},
};
