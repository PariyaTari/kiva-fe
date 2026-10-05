"use client";

import { useState } from "react";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Modal from "@/app/_components/ui/modal/modal";
import { ProductMedia } from "../../_types/product.type";

type VideoModalProps = {
	open: boolean;
	onClose: () => void;
	productName: string;
	colorName: string;
	video: ProductMedia;
	/** Shown (turning, with the progress bar) until the video can play — and if it can't. */
	poster?: string | null;
};

/** «ویدیوی واقعی …» — the clip of the selected colour. */
export default function VideoModal({ open, onClose, productName, colorName, video, poster }: VideoModalProps) {
	// the design's turning-bag placeholder stays until the first frame is ready
	const [ready, setReady] = useState(false);

	return (
		<Modal open={open} onClose={onClose} width={460}>
			<h3>ویدیوی واقعی {productName}</h3>
			<p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
				رنگ {colorName} — فیلم‌برداری‌شده در استودیوی کیوا، بدون ادیت
			</p>
			<div className="vid-box">
				{!ready && (
					<>
						<div className="bagw">
							<MediaImage src={poster ?? video.posterUrl ?? video.thumbnailUrl} alt={video.alt} eager />
						</div>
						<span className="bar2" />
					</>
				)}
				{open && (
					<video
						key={video.url}
						src={video.url}
						poster={video.posterUrl ?? undefined}
						controls
						autoPlay
						muted
						playsInline
						preload="metadata"
						onCanPlay={() => setReady(true)}
						style={ready ? { width: "100%", height: "100%", objectFit: "cover" } : { display: "none" }}
					/>
				)}
			</div>
		</Modal>
	);
}
