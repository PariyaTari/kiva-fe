/** Mirrors the shop listing contract (kiva-openapi.yml · Catalog · `GET /products`). */
import { Breadcrumb, Money, ProductSummary } from "@/types/catalog.type";
import { PageMeta } from "@/types/pageinate";

export type ProductSort = "newest" | "bestselling" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc";

/** The shop's filter state — also the URL query of `/products`. */
export interface ProductFilters {
	q: string;
	category: string[];
	color: string[];
	minPrice: number | null;
	maxPrice: number | null;
	onSale: boolean;
	inStock: boolean;
}

export interface ProductListParams extends ProductFilters {
	sort: ProductSort;
	page: number;
	size: number;
	includeFacets: boolean;
}

/** Active filter chip (removed with one click). */
export interface AppliedFilter {
	key: "q" | "category" | "color" | "price" | "onSale" | "inStock" | "isNew" | "hasVideo" | "bagType" | "material" | "occasion" | "campaign";
	value?: string | null;
	label: string;
	swatchHex?: string | null;
}

export interface FacetOption {
	value: string;
	label: string;
	count: number;
	selected?: boolean;
	hex?: string | null;
}

export interface ProductFacets {
	categories: FacetOption[];
	colors: FacetOption[];
	materials?: FacetOption[];
	bagTypes?: FacetOption[];
	/** Dynamic bounds of the price slider — `null` when nothing matches the filters. */
	price: { min: Money; max: Money; step: number } | null;
	onSaleCount?: number;
	inStockCount?: number;
	newCount?: number;
	withVideoCount?: number;
}

export interface ProductListResponse {
	items: ProductSummary[];
	meta: PageMeta;
	/** «کیف دوشی» / «تخفیف‌خورده‌ها» / «فروشگاه کیوا». */
	title: string;
	subtitle?: string | null;
	breadcrumbs: Breadcrumb[];
	appliedFilters: AppliedFilter[];
	sort: ProductSort;
	facets?: ProductFacets | null;
}
