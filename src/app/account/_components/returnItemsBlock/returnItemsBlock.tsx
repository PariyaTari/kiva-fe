import { Ref } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { OrderItem } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";

export type ReturnLine = { item: OrderItem; returnable: number };

type ReturnItemsBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	lines: ReturnLine[];
	selected: Record<number, boolean>;
	quantities: Record<number, number>;
	onToggle: (id: number, on: boolean) => void;
	onQuantity: (id: number, quantity: number) => void;
	error: boolean;
};

/** Block ۱ «کدوم کیف رو برمی‌گردونی؟» — `.ip` rows; a line with more than one piece gets a quantity stepper. */
export default function ReturnItemsBlock({ blockRef, lines, selected, quantities, onToggle, onQuantity, error }: ReturnItemsBlockProps) {
	return (
		<div ref={blockRef} className={classNames("block", { err: error })}>
			<h3>
				<span className="n">۱</span> کدوم کیف رو برمی‌گردونی؟
			</h3>
			<p className="sub">می‌تونی یک یا چند کیف از این سفارش رو برگردونی.</p>
			<div className="ip-list">
				{lines.map(({ item, returnable }) => {
					const on = !!selected[item.id];
					const qty = quantities[item.id] ?? 1;
					const multi = returnable > 1;
					return (
						<div key={item.id} className={classNames("ip", { off: !returnable })}>
							<label className="check">
								<input type="checkbox" checked={on} disabled={!returnable} onChange={(e) => onToggle(item.id, e.target.checked)} />
								<span className="th">
									<MediaImage src={item.image?.url} alt={item.name} />
								</span>
								<span>
									<b>{item.name}</b>
									<small>
										<span className="swatch-dot" style={{ background: item.color.hex }} /> {item.color.name} ·{" "}
										{!returnable
											? "برای این کیف دیگه نمی‌شه درخواست داد"
											: `${item.quantity > 1 ? `${toPersianDigits(item.quantity)} عدد · هر کدوم ` : ""}${formatPrice(item.unitPrice)} تومان`}
									</small>
								</span>
							</label>
							<span className="end">
								{multi && (
									<span className="qty" hidden={!on} aria-label="تعداد">
										<button type="button" aria-label="بیشتر" disabled={qty >= returnable} onClick={() => onQuantity(item.id, qty + 1)}>
											<Icon name="plus" />
										</button>
										<span>{toPersianDigits(qty)}</span>
										<button type="button" aria-label="کمتر" disabled={qty <= 1} onClick={() => onQuantity(item.id, qty - 1)}>
											<Icon name="minus" />
										</button>
									</span>
								)}
								<span className="p">
									{formatPrice(item.unitPrice * (multi ? qty : 1))} <small className="muted">تومان</small>
								</span>
							</span>
						</div>
					);
				})}
			</div>
			<div className="blk-err">حداقل یه کیف رو برای برگردوندن انتخاب کن.</div>
		</div>
	);
}
