import { CSSProperties } from "react";
import classNames from "classnames";
import BagArt from "../bagArt/bagArt";

type MediaImageProps = {
	src?: string | null;
	/** `MediaAsset.alt` may be `null`. */
	alt?: string | null;
	className?: string;
	style?: CSSProperties;
	/** `object-fit: cover` instead of `contain` (covers, banners). */
	cover?: boolean;
	eager?: boolean;
	/**
	 * Colour (palette key or hex) of the bag illustration shown while the item has no photo yet — cart and order rows,
	 * whose `image` / `imageUrl` is `null` until the colour's photo is uploaded. Without it nothing renders.
	 */
	placeholderColor?: string;
};

/**
 * Image of an API `MediaAsset` — fills the box the design's inline illustration occupied (`img.kv-img`).
 * Plain <img>: sources are CDN URLs of any host, already sized by the backend.
 */
export default function MediaImage({ src, alt = "", className, style, cover, eager, placeholderColor }: MediaImageProps) {
	if (!src) return placeholderColor ? <BagArt type="tote" color={placeholderColor} /> : null;
	return (
		// eslint-disable-next-line @next/next/no-img-element -- remote CDN media, responsive sizes come from the API
		<img
			src={src}
			alt={alt ?? ""}
			className={classNames("kv-img", { cover }, className)}
			style={style}
			loading={eager ? "eager" : "lazy"}
			decoding="async"
			draggable={false}
		/>
	);
}
