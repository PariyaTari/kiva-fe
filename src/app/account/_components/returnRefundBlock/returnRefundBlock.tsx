import { Fragment, ReactNode, Ref } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { RefundMethod } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatIban, ibanDigits, REFUND_METHODS } from "../../_utils/returnForm";

type ReturnRefundBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	method: RefundMethod;
	onMethod: (method: RefundMethod) => void;
	/** The 24 digits after `IR`. */
	iban: string;
	onIban: (digits: string) => void;
	ibanError: string | null;
	/** Card the order was paid with (`6037-99**-****-1234`). */
	cardMask?: string | null;
};

/** Block ۴ «مبلغ به کجا برگرده؟» — the same card or an IBAN (with its field); store credit left the contract in 1.12.0. */
export default function ReturnRefundBlock({ blockRef, method, onMethod, iban, onIban, ibanError, cardMask }: ReturnRefundBlockProps) {
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
		BANK_TRANSFER: "اگه کارتت عوض شده یا می‌خوای به حساب دیگه‌ای واریز بشه",
	};

	return (
		<div ref={blockRef} className="block">
			<h3>
				<span className="n">۴</span> مبلغ به کجا برگرده؟
			</h3>
			<p className="sub">بعد از رسیدن کیف به ما و بررسی‌اش، مبلغ برگشت داده می‌شه.</p>
			<div className="rm-list">
				{REFUND_METHODS.map((r) => (
					<Fragment key={r.key}>
						<label className="opt-card">
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
						{r.key === "BANK_TRANSFER" && method === "BANK_TRANSFER" && (
							<div className="iban-x">
								<div className={classNames("field", { error: !!ibanError })}>
									<label htmlFor="iban">شماره شبا</label>
									<div className="iban">
										<span>IR</span>
										<input
											id="iban"
											inputMode="numeric"
											autoComplete="off"
											placeholder="۰۶ ۰۱۷۰ ۰۰۰۰ ۰۰۱۲ ۳۴۵۶ ۷۸۹۰ ۰۱"
											value={formatIban(iban)}
											onChange={(e) => onIban(ibanDigits(e.target.value))}
										/>
									</div>
									<span className="help">۲۴ رقم بعد از IR — حساب به نام خودت باشه.</span>
									<span className="err">{ibanError}</span>
								</div>
							</div>
						)}
					</Fragment>
				))}
			</div>
		</div>
	);
}
