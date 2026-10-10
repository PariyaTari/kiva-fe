"use client";

import { useState } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Modal from "@/app/_components/ui/modal/modal";
import { OrderMediaItem } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { clockTime, dayLong } from "../../_utils/orderActions";

type MediaLightboxProps = {
	open: boolean;
	onClose: () => void;
	items: OrderMediaItem[];
	index: number;
	onIndex: (index: number) => void;
	/** «کیف دوشی ماهک — مشکی · سفارش KV-…». */
	caption: string;
	/** While the photos wait for an answer: «همونه!» / «می‌خوام عوضش کنم» under the photo. */
	decide?: {
		deadline?: string | null;
		canChange?: boolean;
		approving?: boolean;
		onApprove: () => void;
		onChange: () => void;
	};
};

/** The design's `openLb` — the pre-shipment photos and video, one at a time with prev / next. */
export default function MediaLightbox({ open, onClose, items, index, onIndex, caption, decide }: MediaLightboxProps) {
	const item = items[index];
	const step = (delta: number) => onIndex((index + delta + items.length) % items.length);

	return (
		<Modal open={open} onClose={onClose} width={560}>
			<h3>کیف شما، قبل از ارسال</h3>
			<p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
				{caption}
			</p>
			<div className="lb" id="lbImg">
				{/* keyed so a video stops when the shopper moves on */}
				{item && (item.type === "VIDEO" ? <LightboxVideo key={item.id} item={item} /> : <MediaImage key={item.id} src={item.url} alt={item.alt} eager />)}
			</div>
			<div className="lb-cap">
				<button type="button" className="icon-btn" id="lbPrev" aria-label="قبلی" onClick={() => step(-1)}>
					<Icon name="right" />
				</button>
				<span id="lbN">
					{toPersianDigits(index + 1)} از {toPersianDigits(items.length)}
					{item?.type === "VIDEO" ? " · ویدیو" : ""}
				</span>
				<button type="button" className="icon-btn" id="lbNext" aria-label="بعدی" onClick={() => step(1)}>
					<Icon name="left" />
				</button>
			</div>
			{decide && (
				<div className="m-foot">
					{decide.deadline && (
						<span className="sp">
							<Icon name="clock" /> تا {dayLong(decide.deadline)}، ساعت {clockTime(decide.deadline)}
						</span>
					)}
					{decide.canChange && (
						<button type="button" className="btn btn-white" onClick={decide.onChange}>
							<Icon name="swap" /> می‌خوام عوضش کنم
						</button>
					)}
					<button type="button" className={classNames("btn btn-primary", { loading: decide.approving })} onClick={decide.onApprove}>
						<Icon name="check" /> همونه! ارسالش کن
					</button>
				</div>
			)}
		</Modal>
	);
}

/** The design's poster with a play disc; a tap swaps in the real video. */
function LightboxVideo({ item }: { item: OrderMediaItem }) {
	const [playing, setPlaying] = useState(false);

	if (playing)
		return (
			<video
				src={item.url}
				poster={item.posterUrl ?? item.thumbnailUrl ?? undefined}
				controls
				autoPlay
				playsInline
				style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--r)" }}
			/>
		);

	return (
		<div style={{ position: "relative", height: "100%" }}>
			<MediaImage src={item.posterUrl ?? item.thumbnailUrl} alt={item.alt} eager />
			<button
				type="button"
				aria-label="پخش ویدیو"
				onClick={() => setPlaying(true)}
				style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "none", border: 0, cursor: "pointer" }}
			>
				<span style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(42,31,61,.75)", color: "#fff", display: "grid", placeItems: "center" }}>
					<Icon name="play" width={28} height={28} />
				</span>
			</button>
		</div>
	);
}
