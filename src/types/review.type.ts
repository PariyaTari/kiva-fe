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
	/** Only in «نظرات من». */
	product?: ProductRef;
	authorName: string;
	authorInitial?: string;
	rating: number;
	title?: string | null;
	text: string;
	createdAt: string;
	status: ReviewStatus;
	/** «در انتظار تأیید». */
	statusLabel?: string;
	rejectionReason?: string | null;
	/** The «خریدار» tag. */
	isVerifiedBuyer?: boolean;
	purchasedColor?: Color | null;
	reply?: ReviewReply | null;
	helpfulCount?: number;
	myHelpfulVote?: boolean | null;
	media?: MediaAsset[];
	isMine?: boolean;
}

/** Answer of `PUT /reviews/{id}/helpful` — the new count and the shopper's vote. */
export interface ReviewHelpfulVote {
	helpfulCount: number;
	myVote: boolean | null;
}

export interface CreateReviewPayload {
	rating: number;
	/** Empty → «کاربر کیوا». */
	authorName?: string;
	/** Mobile or e-mail (the design form has it; defaults to the account's mobile). */
	contact?: string;
	text: string;
	orderItemId?: number | null;
}
