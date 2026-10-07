"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { isReservationUnavailableError } from "@/app/cart/_utils/apiError";
import { Icon } from "@/app/_components/icon/icons";
import Switch from "@/app/_components/ui/switch/switch";
import { toast } from "@/store/notification.store";
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
 * Block ۳ «روش ارسال» + the optional `.res-line` reservation switch beside it. Both live on the cart, so a
 * change is saved there and the checkout context is re-read for the new totals. An order that joins an
 * active reservation (`consolidation`) ships with the group's method and has no switch (contract 1.2.0).
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
		onSuccess: refresh,
		onError: (e) => {
			// no longer available for this cart — re-read so the reason shows
			if (isReservationUnavailableError(e)) refresh();
			toast(e.description, { type: isReservationUnavailableError(e) ? "warning" : "error" });
		},
	});

	// the controls follow the click right away; a joining order keeps the group's method
	const locked = consolidation?.shippingMethod;
	const method = locked ?? (setMethod.isPending ? setMethod.variables : selected);
	const reason = reservation?.unavailableReason;
	const notReservable = reason === "ITEM_NOT_RESERVABLE";
	const reserveOn = !notReservable && (setReserve.isPending ? setReserve.variables : !!reservation?.enabled);
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
				{options.map((o) => {
					const disabled = !o.available || (!!locked && o.method !== locked);
					return (
						<label key={o.method} className="opt-card" style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}>
							<input type="radio" name="ship" value={o.method} checked={method === o.method} disabled={disabled} onChange={() => setMethod.mutate(o.method)} />
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
					);
				})}
			</div>
			{(reservation?.available || notReservable) && (
				<div className="res-line">
					<Icon name="timer" />
					<span>
						<b>رزرو {days} روزه</b>
						<small>
							{notReservable
								? "یکی از کالاهای سبدت قابل رزرو نیست؛ این سفارش عادی ارسال می‌شه."
								: reserveOn
									? `ارسال ${shipAfter}؛ تا اون موقع می‌تونی خرید دیگه‌ای اضافه کنی.`
									: `سفارش ${days} روز نگه داشته بشه تا خریدهای بعدی‌ات هم یکجا ارسال بشن.`}
						</small>
					</span>
					<Switch
						id="resSw"
						aria-label="رزرو"
						checked={reserveOn}
						disabled={notReservable || setReserve.isPending}
						onChange={(e) => setReserve.mutate(e.target.checked)}
					/>
				</div>
			)}
			{/* an active reservation: joins it when sent to the same address, ships on its own otherwise */}
			{reason === "HAS_ACTIVE_RESERVATION" && (
				<div className="note cream" style={{ marginTop: 14 }}>
					<Icon name="box" />
					<span>{consolidation?.message ?? "رزرو فعالت برای یه آدرس دیگه‌ست؛ این سفارش جدا و عادی ارسال می‌شه."}</span>
				</div>
			)}
		</div>
	);
}
