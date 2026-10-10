/** Mirrors the product page contract (kiva-openapi.yml · Product, Reviews). */
import { Breadcrumb, Color, ColorKey, MediaAsset, Perk, PriceInfo, ProductSummary, RatingSummary, SeoMeta, StockInfo, Tone } from "@/types/catalog.type";
import { PageMeta } from "@/types/pageinate";
import { Review } from "@/types/review.type";

/** Angle of a gallery image. */
export type MediaView = "FRONT" | "SIDE" | "BACK" | "DETAIL" | "INTERIOR" | "STYLE" | "ON_MODEL" | "SCALE";

export interface ProductMedia extends MediaAsset {
	view?: MediaView | null;
	/** «نمای جلو». */
	viewLabel?: string | null;
	sortOrder?: number;
	isPrimary?: boolean;
	/** «عکس واقعی، بدون ادیت». */
	isUnedited?: boolean;
}

/** One colour of the product — own SKU, price, stock and gallery. */
export interface ProductVariant {
	id: number;
	sku: string;
	color: Color;
	isDefault?: boolean;
	price: PriceInfo;
	stock: StockInfo;
	/** Gallery in order; videos sit in the same list with `type = VIDEO`. */
	media: ProductMedia[];
	hasVideo?: boolean;
	stockAlertSubscribed?: boolean | null;
}

/** A row of the «مشخصات» tab, in display order. */
export interface SpecRow {
	key: string;
	label: string;
	value: string;
	/** Only on the colours row. */
	swatches?: Color[] | null;
	/** e.g. `DANGER` for «فقط ۳ عدد باقی مانده». */
	tone?: Tone | null;
}

export interface ProductPolicies {
	returnable?: boolean;
	returnWindowDays?: number;
	reservable?: boolean;
	reservationDays?: number;
	/** KIVA's signature «photo before shipping». */
	preShipmentPhoto?: boolean;
	maxPerOrder?: number;
}

export interface ProductDetail extends ProductSummary {
	/** From `?color=` or the default colour. */
	selectedColorKey?: ColorKey;
	shortDescription?: string | null;
	/** HTML of the «توضیحات» tab. */
	description?: string | null;
	/** «چرا …؟» bullets. */
	highlights?: string[];
	materialDescription?: string | null;
	specTable: SpecRow[];
	variants: ProductVariant[];
	breadcrumbs: Breadcrumb[];
	ratingSummary: RatingSummary;
	policies?: ProductPolicies;
	perks?: Perk[];
	tags?: string[];
	stockAlert?: { subscribed: boolean; alertId?: number | null } | null;
	shareUrl?: string;
	seo?: SeoMeta;
}

export interface MessengerLink {
	channel: string;
	name: string;
	/** Deep link with the prefilled text (`?text=`). */
	url: string;
	handle?: string;
	/** «پاسخگویی ۹ تا ۲۱». */
	responseHours?: string;
}

/** «سؤال داری؟» — messenger links with a ready message (product, colour and code). */
export interface ProductInquiry {
	productCode: string;
	productName: string;
	colorName: string;
	prefilledText?: string;
	channels: MessengerLink[];
}

export interface ReviewListResponse {
	summary: RatingSummary;
	items: Review[];
	meta: PageMeta;
}
