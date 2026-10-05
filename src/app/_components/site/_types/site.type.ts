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
	imageUrl: string;
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
	popularQueries: string[];
}
