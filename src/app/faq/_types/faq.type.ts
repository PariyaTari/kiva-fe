/** Mirrors the backend FAQ contract (kiva-openapi.yml · Content). */
import { IconName } from "@/app/_components/icon/icon.types";

export interface FaqItem {
	id: number;
	question: string;
	/** HTML. */
	answer: string;
	/** With `<mark>` around the search term (only while searching). */
	questionHighlighted?: string | null;
	answerHighlighted?: string | null;
	sortOrder?: number;
}

export interface FaqGroup {
	/** Anchor of direct links — `faq#reserve`, `faq#shipping`, `faq#return`. */
	id: string;
	name: string;
	icon?: IconName;
	/** The «امضای کیوا» tag. */
	isSignature?: boolean;
	sortOrder?: number;
	questions: FaqItem[];
}

export interface FaqResponse {
	groups: FaqGroup[];
	totalMatches?: number;
	emptyMessage?: string | null;
}
