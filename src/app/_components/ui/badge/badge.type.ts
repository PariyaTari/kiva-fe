import { HTMLAttributes, ReactNode } from "react";

/** The design-system tag tones — the backend `Tone` enum, lower-cased (`SALE` → `"sale"`). */
export type BadgeTone =
	| "default"
	| "sale"
	| "warn"
	| "success"
	| "cream"
	| "dark"
	| "glass"
	| "danger";

export type BadgeSize = "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	tone?: BadgeTone;
	size?: BadgeSize;
	dot?: boolean;
	iconStart?: ReactNode;
	children?: ReactNode;
};
