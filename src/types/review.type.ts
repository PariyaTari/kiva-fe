/** Mirrors the review contract (kiva-openapi.yml · Reviews) — product page and «نظرات من» share it. */
import { Color, MediaAsset, ProductRef } from "./catalog.type";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewReply {
	text: string;
	authorName?: string;
	createdAt?: string;
}

export interface Review {
	id: number;
	productId: number;
	/** Only in «نظرات من»; `null` elsewhere. */
	product?: ProductRef | null;
	/** The name the author gave, else «کاربر کیوا» (never the account's name). */
	authorName: string;
	authorInitial?: string;
	rating: number;
	/** Always `null` (no input for it). */
	title?: string | null;
	/** Plain text with its line breaks — render as text, never as HTML. */
	text: string;
	createdAt: string;
	status: ReviewStatus;
	/** «در انتظار تأیید». */
	statusLabel?: string;
	/** Only for the review's author (and the panel). */
	rejectionReason?: string | null;
	/** The «خریدار» tag — linked to a delivered line of the author's own order. */
	isVerifiedBuyer?: boolean;
	purchasedColor?: Color | null;
	/** Only while the review is `APPROVED`. */
	reply?: ReviewReply | null;
	helpfulCount?: number;
	/** `true` or `null` — «مفید نبود» isn't counted (a guest is always `null`). */
	myHelpfulVote?: true | null;
	media?: MediaAsset[];
	/** The signed-in user's own review — `PENDING` ones come first on page 1 only, approved ones in their place. */
	isMine?: boolean;
}

/** Answer of `PUT /reviews/{id}/helpful` — the new count and the shopper's vote (`helpful: false` takes the vote back). */
export interface ReviewHelpfulVote {
	helpfulCount: number;
	myVote: true | null;
}

export interface CreateReviewPayload {
	rating: number;
	/** Empty → «کاربر کیوا». */
	authorName?: string;
	/** Mobile (`09…`) or e-mail, seen by the panel only; left out → the panel shows the account's mobile. */
	contact?: string;
	/** 10 to 1000 characters after trim, plain text. */
	text: string;
	/**
	 * With `orderItemId` — a row number is unique only inside its order (like `ReviewablePurchase`). Both left out: the server
	 * links the latest delivered line of this product itself.
	 */
	orderCode?: string | null;
	/** Links the review to the purchase → the «خریدار» tag. */
	orderItemId?: number | null;
}
