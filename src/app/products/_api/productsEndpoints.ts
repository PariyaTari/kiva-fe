import { httpClient } from "@/httpClient/HttpClient";
import { ProductListParams, ProductListResponse } from "../_types/products.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const ProductsEndpoints = {
	/** Shop grid; with `includeFacets` the counts and the price bounds of the filter panel come along. */
	listProducts: async (params: ProductListParams) => {
		const res = await httpClient.call<ProductListResponse>({
			method: "GET",
			url: "products",
			params: {
				q: params.q || undefined,
				category: params.category,
				color: params.color,
				minPrice: params.minPrice ?? undefined,
				maxPrice: params.maxPrice ?? undefined,
				onSale: params.onSale || undefined,
				inStock: params.inStock || undefined,
				sort: params.sort,
				page: params.page,
				size: params.size,
				includeFacets: params.includeFacets || undefined,
			},
		});
		return res.data;
	},
};
