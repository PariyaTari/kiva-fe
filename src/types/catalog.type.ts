/** Mirrors the catalog building blocks of the backend contract (kiva-openapi.yml · Catalog / Product). */

/** Integer amount in Toman. */
export type Money = number;

/** Stable palette key, e.g. `lilac`. */
export type ColorKey = string;

/** Icon name of the front-end icon set (`camera`, `truck`, `timer`, …) — see `icon.types.ts`. */
export type IconName = string;

/** Design-system tag tone (`tag`, `tag-sale`, `tag-warn`, …). */
export type Tone = "DEFAULT" | "SALE" | "WARN" | "SUCCESS" | "CREAM" | "DARK" | "GLASS" | "DANGER";

export type BagType = "HOBO" | "CROSSBODY" | "BACKPACK" | "SATCHEL" | "CLUTCH" | "TOTE" | "BUCKET" | "WALLET";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface MediaAsset {
	id: string;
	type: "IMAGE" | "VIDEO";
	url: string;
	thumbnailUrl?: string;
	posterUrl?: string | null;
	width?: number;
	height?: number;
	durationSec?: number | null;
	mimeType?: string;
	alt?: string;
	blurhash?: string | null;
}

export interface Color {
	key: ColorKey;
	name: string;
	hex: string;
	/** Light swatch → the check mark on it is drawn dark. */
	isLight?: boolean;
	sortOrder?: number;
	productCount?: number | null;
}

export interface CategoryRef {
	id: number;
	slug: string;
	name: string;
}

export interface Category extends CategoryRef {
	description?: string | null;
	icon?: {
		bagType: BagType;
		colorKey: ColorKey;
		imageUrl?: string | null;
	};
	imageUrl?: string | null;
	productCount?: number;
	sortOrder?: number;
	showInMenu?: boolean;
	seo?: SeoMeta;
}

export interface MaterialRef {
	id: number;
	slug: string;
	name: string;
	family?: string;
}

export interface PriceInfo {
	price: Money;
	/** Strike-through price; `null` means no discount. */
	compareAtPrice?: Money | null;
	discountPercent?: number;
	discountAmount?: Money;
	currency: "IRT";
}

export interface StockInfo {
	status: StockStatus;
	/** Only set while `LOW_STOCK` — the exact stock is never revealed. */
	availableQuantity?: number | null;
	maxOrderQuantity?: number;
	label?: string;
}

export interface ProductBadge {
	code: "NEW" | "SALE" | "HAS_VIDEO" | "FREE_SHIPPING" | "SOLD_OUT" | "LOW_STOCK" | "BESTSELLER" | "HANDMADE" | "CAMPAIGN";
	label: string;
	tone?: Tone;
	icon?: IconName | null;
}

export interface RatingBrief {
	average: number;
	count: number;
}

export interface RatingSummary {
	average: number;
	count: number;
	/** From 5 stars down to 1. */
	distribution: { stars: number; count: number; percent: number }[];
	verifiedBuyerPercent?: number | null;
}

/** A colour swatch on a card / product page; picking it swaps the card image. */
export interface ProductColorOption {
	variantId: number;
	color: Color;
	stockStatus: StockStatus;
	imageUrl?: string;
	thumbnailUrl?: string;
}

export interface ProductRef {
	id: number;
	slug: string;
	sku?: string;
	name: string;
	imageUrl?: string;
	colorKey?: ColorKey | null;
}

/** Product card (shop grid, home rows, related, wishlist, empty cart). */
export interface ProductSummary {
	id: number;
	slug: string;
	sku: string;
	name: string;
	url?: string;
	category: CategoryRef;
	bagType?: BagType;
	price: PriceInfo;
	colors: ProductColorOption[];
	colorsCount?: number;
	defaultColorKey: ColorKey;
	/** Colour the card image starts with (first matching colour when a colour filter is active). */
	displayColorKey?: ColorKey;
	image: MediaAsset;
	hoverImage?: MediaAsset | null;
	badges: ProductBadge[];
	stock: StockInfo;
	isNew?: boolean;
	hasVideo?: boolean;
	rating?: RatingBrief;
	soldCount?: number;
	freeShippingEligible?: boolean;
	/** `null` for guests. */
	isWishlisted?: boolean | null;
}

export interface Breadcrumb {
	label: string;
	url?: string | null;
}

export interface SeoMeta {
	title?: string;
	description?: string;
	canonicalUrl?: string;
	ogImageUrl?: string;
	noIndex?: boolean;
}

export interface Perk {
	icon: IconName;
	title: string;
	subtitle: string;
}
