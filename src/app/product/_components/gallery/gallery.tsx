"use client";

import { MouseEvent, useRef, useState } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { toneClass } from "@/app/_components/ui/badge/badge";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { BagType, ProductBadge } from "@/types/catalog.type";
import { ProductMedia } from "../../_types/product.type";

/** Badges the design prints on the main image, in its order (low stock lives in the price box instead). */
const IMAGE_TAGS: ProductBadge["code"][] = ["NEW", "SALE", "HAS_VIDEO", "FREE_SHIPPING", "SOLD_OUT"];
const SWIPE_PX = 40;

type GalleryProps = {
	images: ProductMedia[];
	video?: ProductMedia | null;
	badges: ProductBadge[];
	/** Drawn instead of a photo while the colour has none uploaded yet. */
	art: { type?: BagType; color: string };
	view: number;
	/** Bumped on colour / view change → replays the `.swap` animation. */
	swapKey: number;
	onView: (index: number) => void;
	onVideo: () => void;
};

/** `.gal` — thumbs, video thumb, the main image with click-zoom that follows the mouse and swipe on touch. */
export default function Gallery({ images, video, badges, art, view, swapKey, onView, onVideo }: GalleryProps) {
	const [zoom, setZoom] = useState(false);
	const [origin, setOrigin] = useState<string>();
	const touchX = useRef(0);
	const current = images[view] ?? images[0];
	const tags = IMAGE_TAGS.map((code) => badges.find((b) => b.code === code)).filter((b): b is ProductBadge => !!b);

	const follow = (e: MouseEvent<HTMLDivElement>) => {
		if (!zoom) return;
		const r = e.currentTarget.getBoundingClientRect();
		setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
	};

	return (
		<div className="gal">
			<div className="thumbs" id="thumbs" role="tablist" aria-label="تصاویر محصول">
				{images.map((m, i) => (
					<button key={m.id} type="button" className={classNames("thumb", { on: i === view })} role="tab" aria-label={m.viewLabel ?? m.alt ?? undefined} onClick={() => onView(i)}>
						<MediaImage src={m.thumbnailUrl ?? m.url} alt={m.alt} />
					</button>
				))}
				{video && (
					<button type="button" className="thumb vid" id="vidBtn" aria-label="ویدیوی محصول" onClick={onVideo}>
						<MediaImage src={video.thumbnailUrl ?? video.posterUrl} alt={video.alt} />
						<span className="pl">
							<Icon name="play" />
						</span>
						<small>ویدیو</small>
					</button>
				)}
			</div>
			<div
				className={classNames("main-img", { zoom })}
				id="mainImg"
				onClick={() => setZoom((z) => !z)}
				onMouseMove={follow}
				onMouseLeave={() => setZoom(false)}
				onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
				onTouchEnd={(e) => {
					const dx = e.changedTouches[0].clientX - touchX.current;
					if (Math.abs(dx) > SWIPE_PX) onView((view + (dx > 0 ? 1 : -1) + images.length) % images.length);
				}}
			>
				<div className="tags" id="imgTags">
					{tags.map((b) => (
						<span key={b.code} className={classNames("tag", toneClass(b.tone))}>
							{b.icon && <Icon name={b.icon} />}
							{b.label}
						</span>
					))}
				</div>
				<div key={swapKey} className={classNames("im", { swap: swapKey > 0 })} id="im" style={{ transformOrigin: origin }}>
					{current ? <MediaImage src={current.url} alt={current.alt} eager /> : <BagArt type={art.type ?? "tote"} color={art.color} />}
				</div>
				<div className="note-real">
					<span>
						<Icon name="camera" />
						عکس واقعی، بدون ادیت
					</span>
					<span className="zoom-hint">
						<Icon name="search" />
						برای زوم کلیک کن
					</span>
				</div>
			</div>
		</div>
	);
}
