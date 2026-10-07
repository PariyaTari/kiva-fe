import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { OrderCode, OrderItem, RefundMethod } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { dayLong, dayShort, REFUND_DESTINATION, ReturnPayer } from "../../_utils/orderActions";

type ReturnSummaryProps = {
	orderCode: OrderCode;
	deliveredAt?: string | null;
	deadline: number | null;
	picked: { item: OrderItem; quantity: number }[];
	payer: ReturnPayer | undefined;
	method: RefundMethod;
	submitting: boolean;
	onSubmit: () => void;
};

/** `.rt-sum` — the picked bags, the refundable amount, who pays shipping, the policy lines and the submit button. */
export default function ReturnSummary({ orderCode, deliveredAt, deadline, picked, payer, method, submitting, onSubmit }: ReturnSummaryProps) {
	const sum = picked.reduce((s, p) => s + p.item.unitPrice * p.quantity, 0);

	return (
		<aside className="rt-sum">
			<div className="block">
				<h3>
					<Icon name="refresh" /> خلاصه درخواست
				</h3>
				<div className="ohd">
					<Icon name="box" />
					<span>
						سفارش <b>{orderCode}</b>
					</span>
					{deliveredAt && <span className="tag tag-success">تحویل {dayShort(deliveredAt)}</span>}
				</div>
				{picked.length ? (
					picked.map(({ item, quantity }) => (
						<div key={item.id} className="mini">
							<span className="th">
								<MediaImage src={item.image?.url} alt={item.name} />
								{quantity > 1 && <em>{toPersianDigits(quantity)}</em>}
							</span>
							<span>
								<b>{item.name}</b>
								<small>
									<span className="swatch-dot" style={{ background: item.color.hex }} /> {item.color.name}
								</small>
							</span>
							<span className="p">{formatPrice(item.unitPrice * quantity)}</span>
						</div>
					))
				) : (
					<div className="rt-empty">هنوز کیفی انتخاب نکردی</div>
				)}
				<div style={{ marginTop: 8 }}>
					<div className="sum-row">
						<span>مبلغ کیف‌ها</span>
						<b>
							{sum ? formatPrice(sum) : "—"} <small>{sum ? "تومان" : ""}</small>
						</b>
					</div>
					<div className="sum-row">
						<span>هزینه ارسال برگشت</span>
						<b>{payer === "KIVA" ? <span className="free">با کیوا</span> : payer === "CUSTOMER" ? "با خودت" : payer === null ? "بعد از بررسی" : "—"}</b>
					</div>
					<div className="sum-row total">
						<span>مبلغ قابل برگشت</span>
						<b>
							{formatPrice(sum)} <small>تومان</small>
						</b>
					</div>
					<p className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
						مبلغ نهایی بعد از بررسی کیف تأیید می‌شه و به {REFUND_DESTINATION[method]} برمی‌گرده.
					</p>
				</div>
				<div className="rt-policy">
					{deadline && (
						<div>
							<Icon name="clock" />
							<span>مهلت ثبت درخواست: تا {dayLong(deadline)}</span>
						</div>
					)}
					<div>
						<Icon name="shield" />
						<span>کیف باید استفاده‌نشده و با بسته‌بندی اصلی باشه.</span>
					</div>
					<div>
						<Icon name="truck" />
						<span>بعد از تأیید، راهنمای ارسال کیف رو برات پیامک می‌کنیم.</span>
					</div>
				</div>
				<button type="button" className={classNames("btn btn-primary btn-lg btn-block", { loading: submitting })} style={{ marginTop: 14 }} onClick={onSubmit}>
					<Icon name="send" /> ثبت درخواست مرجوعی
				</button>
				<p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 10 }}>
					با ثبت درخواست،{" "}
					<Link className="btn-link" href="/faq#return" style={{ fontSize: 11.5 }}>
						شرایط بازگشت کالا
					</Link>{" "}
					رو می‌پذیری.
				</p>
			</div>
		</aside>
	);
}
