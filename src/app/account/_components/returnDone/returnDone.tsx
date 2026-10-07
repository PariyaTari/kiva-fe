import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import { RefundMethod, ReturnRequest } from "@/types/order.type";
import { copyText } from "@/utils/clipboard";
import { formatPrice } from "@/utils/format";
import { REFUND_DESTINATION, RETURN_STEP } from "../../_utils/orderActions";

type ReturnDoneProps = {
	ret: ReturnRequest;
	/** Sum of the picked bags — the refund isn't decided yet when the request is new. */
	amount: number;
	method: RefundMethod;
};

/** «درخواست مرجوعیت ثبت شد» — the `RT-…` code to keep and the three next steps. */
export default function ReturnDone({ ret, amount, method }: ReturnDoneProps) {
	return (
		<div className="container rt-done">
			<div className="card m-done">
				<div className="ck">
					<Icon name="check" />
				</div>
				<h3>درخواست مرجوعیت ثبت شد</h3>
				<p>کد پیگیری درخواست رو نگه دار؛ همه‌ی مراحلش رو توی «سفارش‌های من» هم می‌بینی.</p>
				<div className="code">
					{ret.code}
					<button type="button" aria-label="کپی" onClick={() => copyText(ret.code, "کد درخواست کپی شد")}>
						<Icon name="copy" />
					</button>
				</div>
				<div>
					<span className={`tag ${RETURN_STEP[ret.status].tone}`}>{ret.statusLabel}</span>
				</div>
				<div className="next">
					<div>
						<span className="nn">۱</span>
						<span>تا ۲۴ ساعت کاری درخواستت رو بررسی می‌کنیم و نتیجه رو پیامک می‌کنیم.</span>
					</div>
					<div>
						<span className="nn">۲</span>
						<span>
							بعد از تأیید، راهنمای ارسال کیف به انبار کیوا برات فرستاده می‌شه؛{" "}
							{ret.shippingPaidBy === "CUSTOMER"
								? "هزینه‌ی ارسال برگشت با خودته."
								: ret.shippingPaidBy === "KIVA"
									? "هزینه‌ی ارسالش با کیواست."
									: "هزینه‌ی ارسالش بعد از بررسی مشخص می‌شه."}
						</span>
					</div>
					<div>
						<span className="nn">۳</span>
						<span>
							بعد از رسیدن و بررسی کیف، {formatPrice(ret.refund?.amount ?? amount)} تومان به {REFUND_DESTINATION[ret.refund?.method ?? method]} برمی‌گرده.
						</span>
					</div>
				</div>
				<div className="acts two">
					<Link className="btn btn-primary" href="/account/orders">
						مشاهده در سفارش‌های من
					</Link>
					<Link className="btn btn-outline" href="/products">
						بازگشت به فروشگاه
					</Link>
				</div>
			</div>
		</div>
	);
}
