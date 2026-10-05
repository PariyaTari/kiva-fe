"use client";

import { useId } from "react";
import classNames from "classnames";
import { BagArtProps, BagKey } from "./bagArt.type";
import { bagMarkup } from "./bagMarkup";

const FROM_API: Record<string, BagKey> = {
	HOBO: "hobo", CROSSBODY: "cross", BACKPACK: "backpack", SATCHEL: "satchel",
	CLUTCH: "clutch", TOTE: "tote", BUCKET: "bucket", WALLET: "wallet",
};

/**
 * Illustrated bag of the design system (`bagSVG` in kiva.js) — used for decorative art: empty states,
 * category icons, hero visuals. Product photos are data (`MediaAsset`) and render as <img>.
 */
export default function BagArt({ type, color, variant = 0, className }: BagArtProps) {
	// gradients are referenced by id → must be unique per instance and safe inside `url(#…)`
	const uid = "kb" + useId().replace(/[^a-zA-Z0-9]/g, "");
	const key = (FROM_API[type] ?? type) as BagKey;

	return (
		<svg
			viewBox="0 0 200 200"
			xmlns="http://www.w3.org/2000/svg"
			className={classNames("bag-svg", className)}
			aria-hidden="true"
			dangerouslySetInnerHTML={{ __html: bagMarkup(key, color, variant, uid) }}
		/>
	);
}
