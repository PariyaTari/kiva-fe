import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { OrderSummary, ReturnRequest } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { dayLong, dayShort, PAYER_TAG, REFUND_DESTINATION, RETURN_REASONS, RETURN_STEP } from "../../_utils/orderActions";
import MiniSteps from "../miniSteps/miniSteps";

/** `.rt-box` — the order's latest return request (`GET /me/returns`): code, status, four steps and what to do next. */
export default function ReturnStatusBox({ ret, order }: { ret: ReturnRequest; order: OrderSummary }) {
	const { tone, step } = RETURN_STEP[ret.status];
	const rejected = ret.status === "REJECTED";
	const refund = ret.refund;
	const destination = REFUND_DESTINATION[refund?.method ?? "ORIGINAL_PAYMENT"];
	const amount = refund ? `${formatPrice(refund.amount)} تومان` : "مبلغش";
	const reason = RETURN_REASONS.find((r) => r.key === ret.reason)?.label;
	const payer = ret.shippingPaidBy ? PAYER_TAG[ret.shippingPaidBy].label : null;
	const first = ret.items[0];
	const thumb = order.itemsPreview.find((p) => p.colorKey === first?.color.key && p.name === first?.name) ?? order.itemsPreview[0];

	return (
		<div className="rt-box">
			<div className="hd">
				<Icon name="refresh" />
				<b>درخواست مرجوعی</b>
				<code>{ret.code}</code>
				<span className={`tag ${tone}`}>{ret.statusLabel}</span>
			</div>
			<MiniSteps
				steps={[
					{ label: "ثبت درخواست", at: dayShort(ret.createdAt) },
					{ label: rejected ? "رد شد" : "تأیید کیوا", at: step > 1 || rejected ? (ret.decidedAt ? dayShort(ret.decidedAt) : undefined) : "تا ۲۴ ساعت" },
					{ label: "رسیدن کیف به ما" },
					{ label: "برگشت وجه", at: ret.status === "REFUNDED" && refund?.completedAt ? dayShort(refund.completedAt) : undefined },
				]}
				current={rejected ? 1 : step}
				icons={["check", "shield", "box", "card"]}
			/>
			<div className="its">
				{thumb && (
					<span className="th">
						<MediaImage src={thumb.imageUrl} alt={thumb.name} />
					</span>
				)}
				<span>
					{ret.items.map((i) => `${i.name} · ${i.color.name} · ${toPersianDigits(i.quantity)} عدد`).join("، ")}
					{reason && ` — دلیل: ${reason}`}
					{payer && ` · ${payer}`}
				</span>
			</div>
			{ret.status === "REQUESTED" ? (
				<div className="note">
					<Icon name="clock" />
					<span>معمولاً تا ۲۴ ساعت کاری بررسی می‌کنیم و نتیجه رو پیامک می‌کنیم.</span>
				</div>
			) : ret.status === "APPROVED" || ret.status === "PICKUP_SCHEDULED" ? (
				<div className="note cream">
					<Icon name="truck" />
					<span>
						<b>{ret.status === "PICKUP_SCHEDULED" ? "دریافت از درِ خونه:" : "راهنمای ارسال:"}</b>{" "}
						{ret.instructions ?? (
							<>
								کیف رو با بسته‌بندی اصلی و همه‌ی متعلقاتش به انبار کیوا بفرست؛ نشانی و کد پس‌کرایه برات پیامک شد
								{ret.shippingPaidBy === "KIVA" ? " و هزینه‌ش با کیواست" : ""}. شماره‌ی درخواست{" "}
								<b className="ltr" style={{ display: "inline-block" }}>
									{ret.code}
								</b>{" "}
								رو روی بسته بنویس.
							</>
						)}
					</span>
				</div>
			) : ret.status === "RECEIVED" ? (
				<div className="note">
					<Icon name="box" />
					<span>
						کیف به دستمون رسید و در حال بررسیه؛ بعد از تأیید، {amount} به {destination} برمی‌گرده.
					</span>
				</div>
			) : ret.status === "REFUNDED" ? (
				<div className="rf">
					<Icon name="card" />
					<span>
						<b>
							{amount} به {destination} برگشت
						</b>
						<small>
							{[refund?.completedAt && dayLong(refund.completedAt), refund?.referenceId && `شماره پیگیری بانک ${toPersianDigits(refund.referenceId)}`]
								.filter(Boolean)
								.join(" · ")}
						</small>
					</span>
				</div>
			) : rejected ? (
				<div className="note danger">
					<Icon name="info" />
					<span>
						<b>درخواستت تأیید نشد{ret.instructions ? ":" : "."}</b> {ret.instructions} اگه فکر می‌کنی اشتباه شده، با پشتیبانی در تماس باش.{" "}
						<Link className="btn-link" href="/contact?topic=return" style={{ fontSize: "inherit" }}>
							تماس با پشتیبانی
						</Link>
					</span>
				</div>
			) : null}
		</div>
	);
}
