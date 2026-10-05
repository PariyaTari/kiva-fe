/** Mirrors the home aggregate of the backend (kiva-openapi.yml · Config & Home). */
import { Category, Color, IconName, MediaAsset, ProductRef, ProductSummary } from "@/types/catalog.type";
import { PageMeta } from "@/types/pageinate";
import { PhotoMessengerChannel, SocialChannel } from "@/types/order.type";

export interface HomeFeature {
	icon: IconName;
	title: string;
	subtitle: string;
}

export interface Banner {
	id: number;
	placement: "HOME_HERO" | "HOME_PROMO" | "SHOP_TOP" | "PRODUCT_SIDEBAR" | "BLOG_TOP";
	theme: "CREAM" | "PURPLE" | "LILAC" | "DARK" | "WHITE";
	tag?: { label: string; icon: IconName } | null;
	/** May contain `\n` line breaks. */
	title: string;
	text: string;
	cta: { label: string; url: string };
	image: MediaAsset;
	/** Label on the photo — a big number («۴ روز رزرو») or a messenger («در بله ارسال شد»). */
	overlay?: { highlight?: string | null; title: string; subtitle: string; channel?: SocialChannel | null } | null;
	sortOrder?: number;
}

export interface Campaign {
	id: number;
	slug: string;
	title: string;
	subtitle: string;
	icon: IconName;
	startsAt: string;
	/** Countdown target. */
	endsAt: string;
	/** Server clock — keeps the countdown honest on a skewed device clock. */
	serverTime?: string;
	products: ProductSummary[];
	seeAllUrl: string;
	isActive: boolean;
}

export interface SatisfactionSummary {
	averageRating: number;
	scale: number;
	totalCount: number;
	metrics: { key: string; label: string; percent: number }[];
	sources: SocialChannel[];
}

export interface Testimonial {
	id: number;
	customerName: string;
	customerInitial: string;
	city: string;
	source: SocialChannel;
	sourceName: string;
	message: string;
	messageTime: string;
	receivedAt: string;
	rating: number;
	product: ProductRef;
	color: Color;
	screenshotUrl?: string | null;
}

export interface TestimonialListResponse {
	summary: SatisfactionSummary;
	items: Testimonial[];
	meta: PageMeta;
}

export interface HowItWorksStep {
	step: number;
	title: string;
	text: string;
	isSignature: boolean;
}

export interface HomePage {
	hero: {
		eyebrow: string;
		title: string;
		text: string;
		primaryCta: { label: string; url: string };
		secondaryCta: { label: string; url: string };
		/** Its colours rotate in the «روی سایت دیدی = قبل از ارسال فرستادیم» visual. */
		showcaseProduct: ProductSummary;
		showcaseMessenger: PhotoMessengerChannel;
	};
	features: HomeFeature[];
	categories: Category[];
	newArrivals: ProductSummary[];
	promos: Banner[];
	sale: Campaign | null;
	testimonials: TestimonialListResponse;
	howItWorks: HowItWorksStep[];
}
