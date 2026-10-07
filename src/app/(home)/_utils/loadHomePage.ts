import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { ProductsEndpoints } from "@/app/products/_api/productsEndpoints";
import { EMPTY_FILTERS } from "@/app/products/_utils/filters";
import { mapError } from "@/httpClient/utils/mapError";
import { HomeEndpoints } from "../_api/homeEndpoints";
import { HomePage } from "../_types/home.type";
import { FEATURES, HERO, HOW_IT_WORKS, NEW_ARRIVALS_COUNT, PROMOS, TESTIMONIALS_COUNT } from "./homeContent";

/** A section the backend can't serve right now is left out (logged) — the page and the other sections still render. */
function valueOr<T, F>(result: PromiseSettledResult<T>, fallback: F, section: string): T | F {
	if (result.status === "fulfilled") return result.value;
	console.error(`[home] ${section}: ${mapError(result.reason).description}`);
	return fallback;
}

/**
 * Server only — the body of `/kiva-configs/home` and of the home page's server prefetch (same `HomePage` shape as the
 * backend's `GET /home`, except the fixed hero visual). The copy and the hero come from this project (`homeContent`);
 * the catalog parts are read from the backend in parallel, as an anonymous visitor.
 */
export async function loadHomePage(): Promise<HomePage> {
	const [categories, newArrivals, sale, testimonials] = await Promise.allSettled([
		SiteEndpoints.listCategories(),
		ProductsEndpoints.listProducts({ ...EMPTY_FILTERS, sort: "newest", page: 1, size: NEW_ARRIVALS_COUNT, includeFacets: false }),
		HomeEndpoints.getActiveCampaign(),
		HomeEndpoints.getTestimonials(1, TESTIMONIALS_COUNT),
	]);

	return {
		hero: HERO,
		features: FEATURES,
		categories: valueOr(categories, [], "categories"),
		newArrivals: valueOr(newArrivals, null, "new arrivals")?.items ?? [],
		promos: PROMOS,
		sale: valueOr(sale, null, "campaign"),
		testimonials: valueOr(testimonials, null, "testimonials"),
		howItWorks: HOW_IT_WORKS,
	};
}
