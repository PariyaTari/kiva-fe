import Link from "next/link";
import classNames from "classnames";
import OrderStepper from "@/app/account/_components/orderStepper/orderStepper";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toneClass } from "@/app/_components/ui/badge/badge";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { GuestTrackingResult } from "../../_types/track.type";
import CopyButton from "../copyButton/copyButton";

/** `.result` of a successful lookup — status, stepper, tracking code and up to four pre-shipment photos. */
export default function TrackResult({ order }: { order: GuestTrackingResult }) {
	const { shipment, preShipmentMedia: media } = order;

	return (
		<div className="result">
			<div className="res-h">
				<div>
					<h3>
						سفارش <span style={{ direction: "ltr", display: "inline-block" }}>{order.code}</span>
					</h3>
					<small>
						ثبت شده در {formatDate(order.placedAt, { weekday: "long", day: "numeric", month: "long" })} · {order.shippingMethod.name}
					</small>
				</div>
				<span className={classNames("tag tag-lg", toneClass(order.statusTone))}>{order.statusLabel}</span>
			</div>
			<OrderStepper progress={order.progress} dates={false} />
			{shipment?.trackingCode ? (
				<div className="trk">
					<span className="lbl">
						<Icon name="truck" /> کد رهگیری {shipment.carrierName ?? order.shippingMethod.name}
					</span>
					<code>{toPersianDigits(shipment.trackingCode)}</code>
					<span className="acts">
						<CopyButton text={shipment.trackingCode} />
						{shipment.trackingUrl && (
							<a className="btn btn-soft btn-sm" target="_blank" rel="noopener noreferrer" href={shipment.trackingUrl}>
								رهگیری <Icon name="arrow" />
							</a>
						)}
					</span>
				</div>
			) : (
				<div className="note" style={{ marginTop: 22 }}>
					<Icon name="info" />
					<span>کد رهگیری بعد از تحویل مرسوله به {order.shippingMethod.name} این‌جا نمایش داده می‌شه.</span>
				</div>
			)}
			{!!media?.preview.length && (
				<>
					<h4 style={{ marginTop: 24, fontSize: 15 }}>
						عکس کیف شما قبل از ارسال{" "}
						<small className="muted" style={{ fontWeight: 400 }}>
							(در {media.channelName} هم ارسال شده)
						</small>
					</h4>
					<div className="res-media">
						{media.preview.slice(0, 4).map((m) => (
							<span key={m.id}>
								<MediaImage src={m.type === "VIDEO" ? (m.posterUrl ?? m.thumbnailUrl) : (m.thumbnailUrl ?? m.url)} alt={m.alt} />
							</span>
						))}
					</div>
				</>
			)}
			<p className="muted" style={{ fontSize: 12.5, marginTop: 18 }}>
				برای دیدن جزئیات کامل، آدرس و همه عکس‌ها{" "}
				<Link className="btn-link" href={`/login?next=${encodeURIComponent("/account/orders")}`} style={{ fontSize: 12.5 }}>
					وارد حساب کاربری
				</Link>{" "}
				شو.
			</p>
		</div>
	);
}
