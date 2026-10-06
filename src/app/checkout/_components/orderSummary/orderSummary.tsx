"use client";

import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { Cart } from "@/types/cart.type";
import { MessengerOption, PhotoMessengerChannel } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";

type OrderSummaryProps = {
	cart: Cart;
	messenger: MessengerOption | null;
	reserveOn: boolean;
	holdDays: number;
	termsUrl: string;
	paying: boolean;
	onPay: () => void;
};

/** `aside.summary` — mini items, totals, the messenger / reservation recap and «پرداخت X تومان». */
export default function OrderSummary({ cart, messenger, reserveOn, holdDays, termsUrl, paying, onPay }: OrderSummaryProps) {
	const { totals, discount } = cart;
	const method = cart.shippingOptions.find((o) => o.method === cart.shippingMethod);

	return (
		<aside className="summary">
			<div className="block">
				<h3>
					<Icon name="bag" /> سفارش شما
					<Link className="btn-link act" href="/cart" style={{ fontSize: 13 }}>
						ویرایش
					</Link>
				</h3>
				{cart.items.map((item) => (
					<div key={item.id} className="mini">
						<span className="th">
							<MediaImage src={item.image?.url} alt={item.image?.alt ?? item.product.name} />
							<em>{toPersianDigits(item.quantity)}</em>
						</span>
						<span>
							<b>{item.product.name}</b>
							<small>
								<span className="swatch-dot" style={{ background: item.color.hex, width: 10, height: 10 }} /> {item.color.name}
							</small>
						</span>
						<span className="p">{formatPrice(item.lineTotal)}</span>
					</div>
				))}
				<div style={{ marginTop: 12 }}>
					<div className="sum-row">
						<span>قیمت کالاها</span>
						<b>
							{formatPrice(totals.itemsCompareAtTotal)} <small>تومان</small>
						</b>
					</div>
					{totals.productDiscount > 0 && (
						<div className="sum-row disc">
							<span>تخفیف محصولات</span>
							<b>−{formatPrice(totals.productDiscount)}</b>
						</div>
					)}
					{totals.codeDiscount > 0 && (
						<div className="sum-row disc">
							<span>کد تخفیف{discount ? ` (${discount.code})` : ""}</span>
							<b>−{formatPrice(totals.codeDiscount)}</b>
						</div>
					)}
					<div className="sum-row">
						<span>ارسال ({method?.name})</span>
						<b>{totals.shippingCost ? formatPrice(totals.shippingCost) : <span className="free">رایگان</span>}</b>
					</div>
					<div className="sum-row total">
						<span>مبلغ قابل پرداخت</span>
						<b>
							{formatPrice(totals.payable)} <small>تومان</small>
						</b>
					</div>
				</div>
				<div className="recap">
					{messenger ? (
						<div className="mi" id="recMsgr">
							<MessengerIcon channel={messenger.channel as PhotoMessengerChannel} /> عکس قبل از ارسال در {messenger.name}
						</div>
					) : (
						<div className="mi" id="recMsgr">
							<Icon name="camera" /> پیام‌رسان هنوز انتخاب نشده
						</div>
					)}
					{reserveOn && (
						<div>
							<Icon name="timer" /> رزرو {toPersianDigits(holdDays)} روزه فعاله
						</div>
					)}
				</div>
				<button type="button" className={classNames("btn btn-primary btn-lg btn-block", { loading: paying })} id="payBtn" style={{ marginTop: 14 }} aria-busy={paying || undefined} onClick={onPay}>
					<Icon name="lock" /> پرداخت {formatPrice(totals.payable)} تومان
				</button>
				<p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 10 }}>
					با پرداخت،{" "}
					<Link className="btn-link" href={termsUrl} style={{ fontSize: 11.5 }}>
						قوانین کیوا
					</Link>{" "}
					رو می‌پذیری.
				</p>
			</div>
		</aside>
	);
}
