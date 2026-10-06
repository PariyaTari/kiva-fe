"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { Icon } from "@/app/_components/icon/icons";
import Switch from "@/app/_components/ui/switch/switch";
import { CartReservation, ReservationConsolidation, ShippingMethodCode, ShippingOptionQuote } from "@/types/cart.type";
import { toPersianDigits } from "@/utils/digits";
import { formatDate, formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";

type ShippingBlockProps = {
	options: ShippingOptionQuote[];
	selected: ShippingMethodCode;
	reservation?: CartReservation;
	consolidation?: ReservationConsolidation | null;
};

/**
 * Block ۳ «روش ارسال» + the `.res-line` reservation switch. Both live on the cart, so a change is saved
 * there and the checkout context is re-read for the new totals.
 */
export default function ShippingBlock({ options, selected, reservation, consolidation }: ShippingBlockProps) {
	const queryClient = useQueryClient();

	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["checkout"] });
		queryClient.invalidateQueries({ queryKey: ["cart"] });
	};

	const setMethod = useMutation({
		mutationFn: (method: ShippingMethodCode) => withMappedError(() => CartEndpoints.setShippingMethod(method)),
		meta: { showNotification: true },
		onSuccess: refresh,
	});

	const setReserve = useMutation({
		mutationFn: (enabled: boolean) => withMappedError(() => CartEndpoints.setReservation(enabled)),
		meta: { showNotification: true },
		onSuccess: refresh,
	});

	// the controls follow the click right away
	const method = setMethod.isPending ? setMethod.variables : selected;
	const reserveOn = setReserve.isPending ? setReserve.variables : !!reservation?.enabled;
	const days = toPersianDigits(reservation?.holdDays ?? 4);
	const shipAfter = reservation?.shipAfterDate
		? `بعد از ${formatDate(reservation.shipAfterDate, { weekday: "long", day: "numeric", month: "long" })}`
		: `${days} روز بعد`;

	return (
		<div className="block">
			<h3>
				<span className="n">۳</span> روش ارسال
			</h3>
			<div className="ship-opts">
				{options.map((o) => (
					<label key={o.method} className="opt-card" style={o.available ? undefined : { opacity: 0.55, cursor: "not-allowed" }}>
						<input type="radio" name="ship" value={o.method} checked={method === o.method} disabled={!o.available} onChange={() => setMethod.mutate(o.method)} />
						<span className="radio" />
						<span className="ic">
							<Icon name={o.icon ?? (o.method === "TIPAX" ? "truck" : "box")} />
						</span>
						<span>
							<span className="t">{o.name}</span>
							<span className="d" style={{ display: "block" }}>
								{o.available ? o.description : o.unavailableReason}
							</span>
						</span>
						<span className="end">
							{o.isFree ? (
								<span className="free">رایگان</span>
							) : (
								<>
									{formatPrice(o.cost)} <small className="muted">تومان</small>
								</>
							)}
						</span>
					</label>
				))}
			</div>
			{reservation?.available && (
				<div className="res-line">
					<Icon name="timer" />
					<span>
						<b>رزرو {days} روزه</b>
						<small>
							{reserveOn
								? `ارسال ${shipAfter}؛ تا اون موقع می‌تونی خرید دیگه‌ای اضافه کنی.`
								: `سفارش ${days} روز نگه داشته بشه تا خریدهای بعدی‌ات هم یکجا ارسال بشن.`}
						</small>
					</span>
					<Switch id="resSw" aria-label="رزرو" checked={reserveOn} disabled={setReserve.isPending} onChange={(e) => setReserve.mutate(e.target.checked)} />
				</div>
			)}
			{consolidation && (
				<div className="note cream" style={{ marginTop: 14 }}>
					<Icon name="box" />
					<span>{consolidation.message}</span>
				</div>
			)}
		</div>
	);
}
