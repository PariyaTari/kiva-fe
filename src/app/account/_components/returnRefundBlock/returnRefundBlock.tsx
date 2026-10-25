import { ReactNode, Ref } from "react";
import { Icon } from "@/app/_components/icon/icons";
import { RefundMethod } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { REFUND_METHODS } from "../../_utils/returnForm";

type ReturnRefundBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	method: RefundMethod;
	onMethod: (method: RefundMethod) => void;
	/** Card the order was paid with (`6037-99**-****-1234`). */
	cardMask?: string | null;
};

/**
 * Block ۴ «مبلغ به کجا برگرده؟» — the same card, or an IBAN a colleague asks for on the phone: the IBAN field of the design
 * left in contract 1.21.0 (no IBAN is stored); store credit left in 1.12.0.
 */
export default function ReturnRefundBlock({ blockRef, method, onMethod, cardMask }: ReturnRefundBlockProps) {
	const hint: Record<RefundMethod, ReactNode> = {
		ORIGINAL_PAYMENT: (
			<>
				{cardMask ? (
					<>
						{/* its own LTR run — inside the RTL line the digit groups were laid out right to left */}
						کارت{" "}
						<span className="ltr" style={{ display: "inline-block" }}>
							{toPersianDigits(cardMask)}
						</span>
					</>
				) : (
					"همون کارتی که باهاش پرداخت کردی"
				)}{" "}
				· ۳ تا ۷ روز کاری بعد از رسیدن کیف به ما
			</>
		),
		BANK_TRANSFER: "اگه کارتت عوض شده یا می‌خوای به حساب دیگه‌ای واریز بشه؛ همکارهامون برای گرفتن شماره شبا باهات تماس می‌گیرن",
	};

	return (
		<div ref={blockRef} className="block">
			<h3>
				<span className="n">۴</span> مبلغ به کجا برگرده؟
			</h3>
			<p className="sub">بعد از رسیدن کیف به ما و بررسی‌اش، مبلغ برگشت داده می‌شه.</p>
			<div className="rm-list">
				{REFUND_METHODS.map((r) => (
					<label key={r.key} className="opt-card">
						<input type="radio" name="rm" value={r.key} checked={method === r.key} onChange={() => onMethod(r.key)} />
						<span className="radio" />
						<span className="ic">
							<Icon name={r.icon} />
						</span>
						<span>
							<span className="t" style={{ display: "block" }}>
								{r.title}
							</span>
							<span className="d" style={{ display: "block" }}>
								{hint[r.key]}
							</span>
						</span>
					</label>
				))}
			</div>
		</div>
	);
}
