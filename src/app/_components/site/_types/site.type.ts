/** Mirrors the header search contract (kiva-openapi.yml · Search). */
import { CategoryRef, Color, ColorKey, PriceInfo } from "@/types/catalog.type";

export interface SearchSuggestProduct {
	id: number;
	slug: string;
	name: string;
	/** `<mark>`-highlighted, HTML-escaped by the server. */
	nameHighlighted: string;
	categoryName: string;
	price: PriceInfo;
	/** Set when the query named a colour — image & link open in that colour. */
	matchedColorKey?: ColorKey | null;
	/** Small photo of the matched (or default) colour; `null` for a bag without photos. */
	imageUrl: string | null;
	/** With `?color=` only when `matchedColorKey` is set. */
	url: string;
}

export interface SearchSuggestResponse {
	query: string;
	normalizedQuery: string;
	products: SearchSuggestProduct[];
	categories: CategoryRef[];
	colors: Color[];
	totalProducts: number;
	seeAllUrl: string;
}

export interface SearchHints {
	categories: CategoryRef[];
	colors: Color[];
	/** A hand-made list of the site's content (no search log is kept). */
	popularQueries: string[];
}
