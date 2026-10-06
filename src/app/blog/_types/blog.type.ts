/** Mirrors the backend blog contract (kiva-openapi.yml · Blog). */
import { Breadcrumb, MediaAsset, ProductSummary } from "@/types/catalog.type";
import { MessengerLink } from "@/app/product/_types/product.type";
import { PageMeta } from "@/types/pageinate";

export interface BlogCategory {
	id: number;
	slug: string;
	name: string;
	postCount?: number;
}

export interface BlogAuthor {
	id: number;
	name: string;
	title?: string;
	initial?: string;
	avatarUrl?: string | null;
	bio?: string;
}

export interface BlogPostSummary {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	category: BlogCategory;
	cover: MediaAsset;
	/** Background of the illustrated cover (shown while the image loads). */
	coverBackground?: string | null;
	readingMinutes: number;
	publishedAt: string;
	author?: BlogAuthor;
	/** «منتخب سردبیر». */
	isFeatured?: boolean;
	tags?: string[];
}

export type BlogBlockType = "HEADING" | "PARAGRAPH" | "QUOTE" | "TIP" | "PRODUCT" | "IMAGE" | "LIST";

/** One block of the article body — rendered exactly like the design's prose. */
export interface BlogContentBlock {
	type: BlogBlockType;
	/** `HEADING` anchors feed the table of contents. */
	anchor?: string | null;
	text?: string | null;
	html?: string | null;
	title?: string | null;
	items?: string[] | null;
	product?: ProductSummary | null;
	image?: MediaAsset | null;
}

export interface BlogPostDetail extends BlogPostSummary {
	/** The large opening paragraph. */
	lead?: string;
	blocks: BlogContentBlock[];
	toc?: { anchor: string; title: string }[];
	breadcrumbs?: Breadcrumb[];
	shareUrl?: string;
	shareLinks?: MessengerLink[];
	helpfulStats?: { helpfulCount: number; notHelpfulCount: number };
	seo?: { title?: string; description?: string };
	updatedAt?: string;
}

export interface BlogPostListResponse {
	/** Only on page 1 and only when it matches the filters — never repeated in `items`. */
	featured?: BlogPostSummary | null;
	items: BlogPostSummary[];
	meta: PageMeta;
	emptyMessage?: string | null;
}
