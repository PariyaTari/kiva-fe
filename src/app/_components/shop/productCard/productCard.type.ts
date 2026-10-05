import { ColorKey, ProductSummary } from "@/types/catalog.type";

export type ProductCardProps = {
	product: ProductSummary;
	/** Colour the card starts with; defaults to the API's `displayColorKey`. */
	colorKey?: ColorKey | null;
	/** Reveal stagger in seconds (`--d`). */
	delay?: number;
	/** `false` → no fade-in (cards inside already-animated containers). */
	reveal?: boolean;
};
