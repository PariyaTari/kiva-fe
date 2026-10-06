import { httpClient } from "@/httpClient/HttpClient";
import { Province } from "@/types/address.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const GeoEndpoints = {
	/** Provinces with their cities — one request feeds both selects of the address form. */
	getProvinces: async () => {
		const res = await httpClient.call<Province[]>({ method: "GET", url: "geo/provinces", params: { includeCities: true } });
		return res.data;
	},
};
