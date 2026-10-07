import { Ref } from "react";
import classNames from "classnames";
import { ReturnReason } from "@/types/order.type";
import { PAYER_TAG, RETURN_REASONS } from "../../_utils/orderActions";

type ReturnReasonBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	reason: ReturnReason | null;
	onReason: (reason: ReturnReason) => void;
	error: boolean;
};

/** Block ۲ «دلیلش چیه؟» — each reason says who pays the return shipping. */
export default function ReturnReasonBlock({ blockRef, reason, onReason, error }: ReturnReasonBlockProps) {
	return (
		<div ref={blockRef} className={classNames("block", { err: error })}>
			<h3>
				<span className="n">۲</span> دلیلش چیه؟
			</h3>
			<p className="sub">اگه مشکل از طرف ما باشه، هزینه‌ی ارسال برگشت با کیواست.</p>
			<div className="rs-grid">
				{RETURN_REASONS.map((r) => {
					const tag = PAYER_TAG[r.payer ?? "null"];
					return (
						<label key={r.key} className="opt-card">
							<input type="radio" name="rr" value={r.key} checked={reason === r.key} onChange={() => onReason(r.key)} />
							<span className="radio" />
							<span>
								<span className="t">{r.label}</span>
								<span className="d">{r.hint}</span>
								<span className={classNames("tag", tag.tone)}>{tag.label}</span>
							</span>
						</label>
					);
				})}
			</div>
			<div className="blk-err">دلیل مرجوعی رو انتخاب کن.</div>
		</div>
	);
}
