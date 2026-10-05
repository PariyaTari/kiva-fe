import { ProductFilters, ProductSort } from "../_types/products.type";

export const DEFAULT_SORT: ProductSort = "newest";

export const EMPTY_FILTERS: ProductFilters = {
	q: "",
	category: [],
	color: [],
	minPrice: null,
	maxPrice: null,
	onSale: false,
	inStock: false,
};

/** The design's four sort buttons (API sort keys). */
export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
	{ value: "newest", label: "جدیدترین" },
	{ value: "bestselling", label: "پرفروش‌ترین" },
	{ value: "price_asc", label: "ارزان‌ترین" },
	{ value: "price_desc", label: "گران‌ترین" },
];

const SORTS = new Set<string>(["newest", "bestselling", "price_asc", "price_desc", "discount_desc", "rating_desc"]);
const list = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null);

/** `/products?category=a,b&color=…&minPrice=…&onSale=true&sort=…` → filter state. */
export function parseFilters(search: URLSearchParams): { filters: ProductFilters; sort: ProductSort } {
	const sort = search.get("sort");
	return {
		filters: {
			q: search.get("q") ?? "",
			category: list(search.get("category")),
			color: list(search.get("color")),
			minPrice: num(search.get("minPrice")),
			maxPrice: num(search.get("maxPrice")),
			onSale: search.get("onSale") === "true",
			inStock: search.get("inStock") === "true",
		},
		sort: sort && SORTS.has(sort) ? (sort as ProductSort) : DEFAULT_SORT,
	};
}

/** Filter state → the shop's URL query (empty values omitted, same keys as the API). */
export function toSearch(filters: ProductFilters, sort: ProductSort): string {
	const p = new URLSearchParams();
	if (filters.q) p.set("q", filters.q);
	if (filters.category.length) p.set("category", filters.category.join(","));
	if (filters.color.length) p.set("color", filters.color.join(","));
	if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
	if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
	if (filters.onSale) p.set("onSale", "true");
	if (filters.inStock) p.set("inStock", "true");
	if (sort !== DEFAULT_SORT) p.set("sort", sort);
	const s = p.toString();
	return s ? `?${s}` : "";
}

export const sameFilters = (a: ProductFilters, b: ProductFilters) => JSON.stringify(a) === JSON.stringify(b);
