import { BagType } from "@/types/catalog.type";

/** Design bag keys (kiva.js) — the API's `BagType` is accepted as well. */
export type BagKey = "hobo" | "cross" | "backpack" | "satchel" | "clutch" | "tote" | "bucket" | "wallet";

export type BagArtProps = {
	type: BagKey | BagType;
	/** Palette key (`lilac`) or a raw hex colour. */
	color: string;
	/** Design variants: 0 front · 1 close-up · 2 white halo · 3 mirrored side view. */
	variant?: 0 | 1 | 2 | 3;
	className?: string;
};
