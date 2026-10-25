/** Mirrors the review contract (kiva-openapi.yml · Reviews) — product page and «نظرات من» share it. */
import { Color, MediaAsset, ProductRef } from "./catalog.type";
import { OrderCode } from "./order.type";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewReply {
	text: string;
	authorName?: string;
	createdAt?: string;
}

export interface Review {
	id: number;
	productId: number;
	/** In «نظرات من» (and the panel), with whatever state the product has now; `null` elsewhere. */
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

/**
 * `PATCH /me/reviews/{id}` — only a `PENDING` or `REJECTED` review (`422 REVIEW_NOT_EDITABLE` otherwise); a rejected one goes back
 * to `PENDING`. A field left out stays as it is (`contact` is never sent: the review doesn't return it, so it can't be shown).
 */
export interface UpdateReviewPayload {
	rating?: number;
	/** `""` → «کاربر کیوا». */
	authorName?: string;
	text?: string;
}

/** `GET /me/reviews/pending-products` — a delivered line whose product has no live review of the user (one per product). */
export interface ReviewablePurchase {
	orderCode: OrderCode;
	/** Row number inside that order. */
	orderItemId: number;
	product: ProductRef;
	/** The colour bought (the line's snapshot). */
	color: Color;
	deliveredAt: string;
}

/** Which purchase a new review is about — «نظر بده» of «نظرات من» links to the product page with it (`?order=&item=`). */
export type ReviewPurchaseRef = Pick<ReviewablePurchase, "orderCode" | "orderItemId">;
