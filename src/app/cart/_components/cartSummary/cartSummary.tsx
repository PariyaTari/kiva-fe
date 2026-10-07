"use client";

import { RefObject } from "react";
import { Icon } from "@/app/_components/icon/icons";
import { Cart } from "@/types/cart.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";

type CartSummaryProps = {
	cart: Cart;
	signedIn: boolean;
	/** `#totalVal` — pulses when the payable changes. */
	totalRef: RefObject<HTMLElement | null>;
	onCheckout: () => void;
};

/** `aside.summary` — free-shipping progress, the totals and «ادامه و ثبت اطلاعات ارسال». */
export default function CartSummary({ cart, signedIn, totalRef, onCheckout }: CartSummaryProps) {
	const { totals, freeShipping, reservation } = cart;
	const method = cart.shippingOptions.find((o) => o.method === cart.shippingMethod);
	const savings = totals.productDiscount + totals.codeDiscount;

	return (
		<aside className="summary">
			<div className="block">
				<h3>
					<Icon name="card" /> خلاصه سفارش
				</h3>
				{freeShipping && (
					<div className="free-prog">
						{freeShipping.eligible ? (
							<p className="free">
								<Icon name="check" width={15} height={15} style={{ display: "inline", verticalAlign: -3 }} /> ارسال با پست برات رایگانه!
							</p>
						) : (
							<p>
								فقط <b>{formatPrice(freeShipping.remaining)}</b> تومان تا ارسال رایگان با پست
							</p>
						)}
						<div className="bar">
							<i style={{ width: `${Math.min(100, freeShipping.progressPercent)}%` }} />
						</div>
					</div>
				)}
				<div className="sum-row">
					<span>قیمت کالاها ({toPersianDigits(totals.itemsCount)})</span>
					<b>
						{formatPrice(totals.itemsCompareAtTotal)} <small>تومان</small>
					</b>
				</div>
				{totals.productDiscount > 0 && (
					<div className="sum-row disc">
						<span>تخفیف محصولات</span>
						<b>
							−{formatPrice(totals.productDiscount)} <small>تومان</small>
						</b>
					</div>
				)}
				{totals.codeDiscount > 0 && (
					<div className="sum-row disc">
						<span>کد تخفیف</span>
						<b>
							−{formatPrice(totals.codeDiscount)} <small>تومان</small>
						</b>
					</div>
				)}
				<div className="sum-row">
					<span>هزینه ارسال ({method?.name})</span>
					<b>
						{totals.shippingCost ? (
							<>
								{formatPrice(totals.shippingCost)} <small>تومان</small>
							</>
						) : (
							<span className="free">رایگان</span>
						)}
					</b>
				</div>
				{reservation.available && reservation.enabled && (
					<div className="sum-row">
						<span>رزرو {toPersianDigits(reservation.holdDays)} روزه</span>
						<b className="tag tag-cream">فعال</b>
					</div>
				)}
				<div className="sum-row total">
					<span>مبلغ قابل پرداخت</span>
					<b id="totalVal" ref={totalRef}>
						{formatPrice(totals.payable)} <small>تومان</small>
					</b>
				</div>
				<button type="button" className="btn btn-primary btn-lg btn-block" id="goCheckout" style={{ marginTop: 18 }} onClick={onCheckout}>
					ادامه و ثبت اطلاعات ارسال <Icon name="arrow" />
				</button>
				{savings > 0 && (
					<div className="save-badge">
						<Icon name="sparkle" /> {formatPrice(savings)} تومان صرفه‌جویی کردی!
					</div>
				)}
				<div className="lock-note">
					<Icon name="lock" /> {signedIn ? "پرداخت امن از طریق درگاه بانکی" : "برای پرداخت، با شماره موبایل وارد می‌شی"}
				</div>
			</div>
		</aside>
	);
}
