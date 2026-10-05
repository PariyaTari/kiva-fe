import { CSSProperties } from "react";
import classNames from "classnames";

type MediaImageProps = {
	src?: string | null;
	alt?: string;
	className?: string;
	style?: CSSProperties;
	/** `object-fit: cover` instead of `contain` (covers, banners). */
	cover?: boolean;
	eager?: boolean;
};

/**
 * Image of an API `MediaAsset` — fills the box the design's inline illustration occupied (`img.kv-img`).
 * Plain <img>: sources are CDN URLs of any host, already sized by the backend.
 */
export default function MediaImage({ src, alt = "", className, style, cover, eager }: MediaImageProps) {
	if (!src) return null;
	return (
		// eslint-disable-next-line @next/next/no-img-element -- remote CDN media, responsive sizes come from the API
		<img
			src={src}
			alt={alt}
			className={classNames("kv-img", { cover }, className)}
			style={style}
			loading={eager ? "eager" : "lazy"}
			decoding="async"
			draggable={false}
		/>
	);
}
