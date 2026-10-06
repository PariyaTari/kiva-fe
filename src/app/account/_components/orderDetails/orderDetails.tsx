"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { OrderCode, OrderDetail } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatDate, formatPrice, pad2 } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import MediaLightbox from "../mediaLightbox/mediaLightbox";

/** «۰:۲۴» on a video thumbnail. */
const duration = (sec?: number | null) => (sec ? `${toPersianDigits(Math.floor(sec / 60))}:${pad2(sec % 60)}` : "");

/** The design bolds the messenger's name inside the waiting text. */
const boldName = (text: string, name: string) =>
	text.split(name).map((part, i) => (
		<Fragment key={i}>
			{i > 0 && <b>{name}</b>}
			{part}
		</Fragment>
	));

/** Body of `.det` — loaded the first time the card opens (`GET /me/orders/{code}`). */
export default function OrderDetails({ code }: { code: OrderCode }) {
	const [lightbox, setLightbox] = useState({ open: false, index: 0 });

	const detail = useQuery({
		queryKey: ["me", "orders", "detail", code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(code)),
		meta: { showNotificationOnRefetch: true },
	});

	const detailError = toErrorView(ERROR_BEHAVIOUR, detail.error, "دریافت جزئیات سفارش با خطا مواجه شد.");

	return (
		<div className="det-in">
			{detail.isLoading ? (
				<Loading />
			) : !!detailError ? (
				<ErrorComponent
					retryable={detailError.retryable}
					ticketAble={detailError.ticketAble}
					errorText={detailError.errorText}
					executeFunction={() => detail.refetch()}
					loading={detail.isFetching}
				/>
			) : !detail.error && !!detail.data ? (
				<Details order={detail.data} onOpenMedia={(index) => setLightbox({ open: true, index })} />
			) : null}
			{!!detail.data?.preShipmentMediaDetail?.items.length && (
				<MediaLightbox
					open={lightbox.open}
					onClose={() => setLightbox((l) => ({ ...l, open: false }))}
					items={detail.data.preShipmentMediaDetail.items}
					index={lightbox.index}
					onIndex={(index) => setLightbox({ open: true, index })}
					caption={(() => {
						const item = detail.data.items.find((i) => i.id === detail.data.preShipmentMediaDetail?.items[lightbox.index]?.orderItemId) ?? detail.data.items[0];
						return `${item?.name ?? ""} — ${item?.color.name ?? ""} · سفارش ${code}`;
					})()}
				/>
			)}
		</div>
	);
}

function Details({ order, onOpenMedia }: { order: OrderDetail; onOpenMedia: (index: number) => void }) {
	const media = order.preShipmentMediaDetail;
	const shots = media?.items ?? [];
	const { address, totals } = order;

	return (
		<>
			<div className="media">
				{shots.length && media ? (
					<>
						<h4>
							<Icon name="camera" /> عکس و ویدیوی کیف شما، قبل از ارسال
						</h4>
						<div className="src">
							<MessengerIcon channel={media.channel} /> در {media.channelName} هم برات فرستاده شد
							{media.sentAt ? ` — ${formatDate(media.sentAt, { weekday: "long", day: "numeric", month: "long" })}` : ""}
						</div>
						<div className="media-grid">
							{shots.map((m, i) =>
								m.type === "VIDEO" ? (
									<button key={m.id} type="button" className="mthumb v" aria-label="ویدیو" onClick={() => onOpenMedia(i)}>
										<MediaImage src={m.thumbnailUrl ?? m.posterUrl} alt={m.alt} />
										<span className="pl">
											<Icon name="play" />
										</span>
										<small>ویدیو {duration(m.durationSec)}</small>
									</button>
								) : (
									<button key={m.id} type="button" className="mthumb" aria-label={`عکس ${toPersianDigits(i + 1)}`} onClick={() => onOpenMedia(i)}>
										<MediaImage src={m.thumbnailUrl ?? m.url} alt={m.alt} />
									</button>
								),
							)}
						</div>
					</>
				) : (
					<>
						<h4>
							<Icon name="camera" /> عکس و ویدیوی کیف شما
						</h4>
						<div className="media-wait">
							<Icon name="camera" />
							<span>{media?.waitingMessage ? boldName(media.waitingMessage, media.channelName) : "عکس‌های کیفت قبل از ارسال این‌جا قرار می‌گیره."}</span>
						</div>
					</>
				)}
			</div>

			<div>
				<h4>
					<Icon name="bag" /> کالاها
				</h4>
				{order.items.map((item) => (
					<div key={item.id} className="it-row">
						<span className="th">
							<MediaImage src={item.image?.url} alt={item.image?.alt ?? item.name} />
						</span>
						<span>
							<Link href={`/product/${item.slug ?? item.productId}?color=${item.color.key}`}>
								<b>{item.name}</b>
							</Link>
							<br />
							<small className="muted">
								{item.color.name} · {toPersianDigits(item.quantity)} عدد
							</small>
						</span>
						<span className="p">
							{formatPrice(item.lineTotal)} <small className="muted">تومان</small>
						</span>
					</div>
				))}
			</div>

			<div className="det-cols">
				<div className="card">
					<h4>
						<Icon name="pin" /> تحویل گیرنده
					</h4>
					<b>{address.recipientName}</b> — {toPersianDigits(address.recipientPhone)}
					<br />
					{address.fullText}
					<br />
					کد پستی: {toPersianDigits(address.postalCode)}
				</div>
				<div className="card">
					<h4>
						<Icon name="card" /> خلاصه پرداخت
					</h4>
					<div className="sum-mini">
						<div>
							<span>قیمت کالاها</span>
							<span>{formatPrice(totals.itemsCompareAtTotal)}</span>
						</div>
						{totals.productDiscount > 0 && (
							<div>
								<span>تخفیف محصولات</span>
								<span>−{formatPrice(totals.productDiscount)}</span>
							</div>
						)}
						{totals.codeDiscount > 0 && (
							<div>
								<span>کد تخفیف</span>
								<span>−{formatPrice(totals.codeDiscount)}</span>
							</div>
						)}
						<div>
							<span>ارسال</span>
							<span>{totals.shippingCost ? formatPrice(totals.shippingCost) : "رایگان"}</span>
						</div>
						<div className="t">
							<span>{order.payment?.status === "SUCCEEDED" ? "پرداخت شده" : "قابل پرداخت"}</span>
							<span>{formatPrice(totals.payable)} تومان</span>
						</div>
					</div>
					{media && (
						<p style={{ marginTop: 8, fontSize: 12.5 }} className="muted">
							عکس قبل از ارسال: {media.channelName} ({toPersianDigits(media.phone)})
						</p>
					)}
				</div>
			</div>
		</>
	);
}
