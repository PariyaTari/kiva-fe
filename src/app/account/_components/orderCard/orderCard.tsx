"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toneClass } from "@/app/_components/ui/badge/badge";
import { OrderSummary, ReturnRequest } from "@/types/order.type";
import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";
import { formatDate, formatPrice } from "@/utils/format";
import { hasInvoice, NO_PROGRESS, UNPAID } from "../../_utils/orderActions";
import CancelModal from "../cancelModal/cancelModal";
import ChangeRequestModal from "../changeRequestModal/changeRequestModal";
import InvoiceButton from "../invoiceButton/invoiceButton";
import OrderDetails from "../orderDetails/orderDetails";
import OrderStateBar from "../orderStateBar/orderStateBar";
import OrderStepper from "../orderStepper/orderStepper";
import PayModal from "../payModal/payModal";
import PhotoCheck, { photoCheckState } from "../photoCheck/photoCheck";
import ReorderButton from "../reorderButton/reorderButton";
import ReserveCountdown from "../reserveCountdown/reserveCountdown";
import ReturnStatusBox from "../returnStatusBox/returnStatusBox";

type ModalKind = "pay" | "cancel" | "change";

type OrderCardProps = {
	order: OrderSummary;
	/** The order's latest return request, if any. */
	ret?: ReturnRequest;
};

/**
 * `article.ord` — header, the state's main action on top (pay / reserve / photo check / return status),
 * thumbnails, stepper, tracking code and the `.ord-acts` row; «جزئیات» opens the full order.
 * Which buttons show comes only from the server's `status` and `actions` (kiva-order-actions `index.html`).
 */
export default function OrderCard({ order, ret }: OrderCardProps) {
	const [open, setOpen] = useState(false);
	// details load on the first open and stay mounted so closing animates with content
	const [loaded, setLoaded] = useState(false);
	/** The open modal; `last` keeps it mounted through its exit transition, `seq` gives every opening a fresh form. */
	const [modal, setModal] = useState<{
		open: ModalKind | null;
		last: ModalKind | null;
		seq: number;
	}>({ open: null, last: null, seq: 0 });
	const { status, actions } = order;
	const reservation = order.reservation?.active ? order.reservation : null;
	const shipment = order.shipment;
	const photo = photoCheckState(order);
	const progress = !NO_PROGRESS.includes(status);

	const toggle = () => {
		setOpen((o) => !o);
		setLoaded(true);
	};
	const openModal = (kind: ModalKind) => setModal((m) => ({ open: kind, last: kind, seq: m.seq + 1 }));
	const closeModal = () => setModal((m) => ({ ...m, open: null }));

	const amount = (
		<span className="amt">
			{formatPrice(order.payable)} <small>تومان</small>
		</span>
	);
	const cancelButton = actions?.canCancel && (
		<button type="button" className="btn btn-white btn-sm act-danger end" onClick={() => openModal("cancel")}>
			<Icon name="ban" /> لغو سفارش
		</button>
	);

	return (
		<>
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
					{status === "PENDING_PAYMENT" ? (
						<OrderStateBar tone="warn" icon="card" title="پرداخت این سفارش کامل نشده" text="تا وقتی کیف‌ها موجودن، می‌تونی همین‌جا پرداختش کنی.">
							{amount}
							{actions?.canPay && (
								<button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("pay")}>
									<Icon name="lock" /> پرداخت
								</button>
							)}
						</OrderStateBar>
					) : status === "PAYMENT_FAILED" ? (
						<OrderStateBar
							tone="danger"
							icon="alert"
							title="پرداخت قبلی ناموفق بود"
							text="پرداخت قبلی انجام نشد؛ مبلغی از حسابت کم نشده و می‌تونی دوباره پرداخت کنی."
						>
							{amount}
							{actions?.canPay && (
								<button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("pay")}>
									<Icon name="refresh" /> پرداخت دوباره
								</button>
							)}
						</OrderStateBar>
					) : status === "EXPIRED" ? (
						<OrderStateBar
							icon="clock"
							title="مهلت پرداخت این سفارش تموم شد"
							text="کیف‌ها به فروشگاه برگشتن. اگه هنوز می‌خوایشون، با یه کلیک دوباره به سبدت اضافه می‌شن."
						>
							<ReorderButton order={order} className="btn-dark btn-sm" />
						</OrderStateBar>
					) : status === "CANCELLED" ? (
						<OrderStateBar tone="danger" icon="ban" title="این سفارش لغو شد" text="اگه پرداخت کرده بودی، مبلغ حداکثر تا ۷۲ ساعت به کارتت برمی‌گرده.">
							<ReorderButton order={order} className="btn-white btn-sm" />
						</OrderStateBar>
					) : reservation ? (
						<div className="reserve-bar">
							<Icon name="timer" />
							<span>
								<b>رزرو ۴ روزه فعاله</b>
								<small>
									{reservation.message ??
										`تا ${formatDate(reservation.expiresAt, { weekday: "long", day: "numeric", month: "long" })} هر خریدی کنی، با همین سفارش و بدون هزینه ارسال جدید فرستاده می‌شه.`}
								</small>
							</span>
							{/* fixed for the whole group — joining orders never extend it */}
							<ReserveCountdown expiresAt={reservation.expiresAt} />
							<Link className="btn btn-dark btn-sm" href="/products">
								افزودن محصول
							</Link>
						</div>
					) : photo ? (
						<PhotoCheck order={order} state={photo} onRequestChange={() => openModal("change")} />
					) : null}
					{ret && <ReturnStatusBox ret={ret} order={order} />}
					<div className="thumbs-row">
						{order.itemsPreview.map((item, i) => (
							<span key={`${item.productId}-${item.colorKey}-${i}`}>
								<MediaImage src={item.imageUrl} alt={item.name} />
								{item.quantity > 1 && <em>×{toPersianDigits(item.quantity)}</em>}
							</span>
						))}
					</div>
					{progress && <OrderStepper progress={order.progress} />}
					{progress &&
						(shipment?.trackingCode ? (
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
						))}
					{UNPAID.includes(status) ? (
						<div className="ord-acts">
							<span className="hint">
								<Icon name="receipt" /> فاکتور بعد از پرداخت صادر می‌شه
							</span>
							{cancelButton}
						</div>
					) : hasInvoice(status) ? (
						<div className="ord-acts">
							<InvoiceButton code={order.code} />
							{actions?.canReturn && (
								<Link className="btn btn-white btn-sm" href={`/account/orders/${encodeURIComponent(order.code)}/return`}>
									<Icon name="refresh" /> درخواست مرجوعی
								</Link>
							)}
							{status === "SHIPPED" ? (
								<span className="hint end">
									<Icon name="info" /> ارسال شده؛ بعد از تحویل تا ۷ روز می‌تونی مرجوعش کنی
								</span>
							) : (
								cancelButton
							)}
						</div>
					) : null}
				</div>
				<button type="button" className="det-btn" aria-expanded={open} onClick={toggle}>
					جزئیات سفارش و عکس‌های کیف <Icon name="down" />
				</button>
				<div className="det">
					<div>{loaded && <OrderDetails code={order.code} />}</div>
				</div>
			</Reveal>
			{/* outside the article: its reveal transform would become the fixed modal's containing block */}
			{modal.last === "pay" && <PayModal key={modal.seq} order={order} open={modal.open === "pay"} onClose={closeModal} />}
			{modal.last === "cancel" && (
				<CancelModal key={modal.seq} order={order} open={modal.open === "cancel"} onClose={closeModal} onRequestChange={() => openModal("change")} />
			)}
			{modal.last === "change" && <ChangeRequestModal key={modal.seq} order={order} open={modal.open === "change"} onClose={closeModal} />}
		</>
	);
}
