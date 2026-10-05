"use client";

import { RefObject, useEffect, useState } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { formatPrice } from "@/utils/format";

/** The bar appears once the `.buy` row's bottom edge passes this line. */
const SHOW_BELOW_PX = 60;

type MobileBuyBarProps = {
	buyRef: RefObject<HTMLDivElement | null>;
	price: number;
	soldOut: boolean;
	busy: boolean;
	onAdd: () => void;
	onNotify: () => void;
};

/** `.m-buy` — sticky price + add button on phones (CSS shows it below 760px). */
export default function MobileBuyBar({ buyRef, price, soldOut, busy, onAdd, onNotify }: MobileBuyBarProps) {
	const [on, setOn] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const b = buyRef.current;
			if (b) setOn(b.getBoundingClientRect().bottom < SHOW_BELOW_PX);
		};
		addEventListener("scroll", onScroll, { passive: true });
		return () => removeEventListener("scroll", onScroll);
	}, [buyRef]);

	return (
		<div className={classNames("m-buy", { on })} id="mBuy">
			<div className="pr" id="mPr">
				{soldOut ? (
					"ناموجود"
				) : (
					<>
						{formatPrice(price)} <small>تومان</small>
					</>
				)}
			</div>
			<button type="button" className="btn btn-primary" id="mAdd" disabled={busy} onClick={soldOut ? onNotify : onAdd}>
				{soldOut ? (
					"خبرم کن"
				) : (
					<>
						<Icon name="bag" /> افزودن به سبد
					</>
				)}
			</button>
		</div>
	);
}
