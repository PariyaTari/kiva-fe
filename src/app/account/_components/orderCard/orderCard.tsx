"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toneClass } from "@/app/_components/ui/badge/badge";
import { OrderSummary } from "@/types/order.type";
import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";
import { formatDate, formatPrice } from "@/utils/format";
import OrderDetails from "../orderDetails/orderDetails";
import OrderStepper from "../orderStepper/orderStepper";
import ReserveCountdown from "../reserveCountdown/reserveCountdown";

/** `article.ord` — header, reserve bar, thumbnails, stepper, tracking code; «جزئیات» opens the full order. */
export default function OrderCard({ order }: { order: OrderSummary }) {
	const [open, setOpen] = useState(false);
	// details load on the first open and stay mounted so closing animates with content
	const [loaded, setLoaded] = useState(false);
	const reservation = order.reservation?.active ? order.reservation : null;
	const shipment = order.shipment;

	const toggle = () => {
		setOpen((o) => !o);
		setLoaded(true);
	};

	return (
		<Reveal as="article" className={classNames("ord", { open })} data-oid={order.code}>
			<div className="ord-h">
				<span className="id">{order.code}</span>
				<span className="m">
					<span>
						تاریخ: <b>{formatDate(order.placedAt)}</b>
					</span>
					<span>
						مبلغ: <b>{formatPrice(order.payable)}</b> تومان
					</span>
					<span>
						ارسال: <b>{order.shippingMethod.name}</b>
					</span>
				</span>
				<span className={classNames("tag", toneClass(order.statusTone))}>{order.statusLabel}</span>
			</div>
			<div className="ord-b">
				{reservation && (
					<div className="reserve-bar">
						<Icon name="timer" />
						<span>
							<b>رزرو ۴ روزه فعاله</b>
							<small>
								{reservation.message ??
									`تا ${formatDate(reservation.expiresAt, { weekday: "long", day: "numeric", month: "long" })} هر خریدی کنی، با همین سفارش و بدون هزینه ارسال جدید فرستاده می‌شه.`}
							</small>
						</span>
						<ReserveCountdown expiresAt={reservation.expiresAt} />
						<Link className="btn btn-dark btn-sm" href="/products">
							افزودن محصول
						</Link>
					</div>
				)}
				<div className="thumbs-row">
					{order.itemsPreview.map((item, i) => (
						<span key={`${item.productId}-${item.colorKey}-${i}`}>
							<MediaImage src={item.imageUrl} alt={item.name} />
							{item.quantity > 1 && <em>×{toPersianDigits(item.quantity)}</em>}
						</span>
					))}
				</div>
				<OrderStepper progress={order.progress} />
				{shipment?.trackingCode ? (
					<div className="trk">
						<span className="lbl">
							<Icon name="truck" /> کد رهگیری {shipment.carrierName}
						</span>
						<code>{toPersianDigits(shipment.trackingCode)}</code>
						<span className="acts">
							<button type="button" className="btn btn-white btn-sm" onClick={() => copyText(shipment.trackingCode ?? "", "کد رهگیری کپی شد")}>
								<Icon name="copy" /> کپی
							</button>
							{shipment.trackingUrl && (
								<a className="btn btn-soft btn-sm" href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
									رهگیری <Icon name="arrow" />
								</a>
							)}
						</span>
					</div>
				) : (
					<div className="trk wait">
						<span className="lbl">
							<Icon name="truck" /> کد رهگیری
						</span>
						<span className="muted" style={{ fontSize: 13 }}>
							{shipment?.waitingMessage ?? "—"}
						</span>
					</div>
				)}
			</div>
			<button type="button" className="det-btn" aria-expanded={open} onClick={toggle}>
				جزئیات سفارش و عکس‌های کیف <Icon name="down" />
			</button>
			<div className="det">
				<div>{loaded && <OrderDetails code={order.code} />}</div>
			</div>
		</Reveal>
	);
}
