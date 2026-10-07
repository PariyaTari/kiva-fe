"use client";

import { Fragment, ReactNode } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { CartReservation, ReservationConsolidation } from "@/types/cart.type";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";
import { isReservationUnavailableError } from "../../_utils/apiError";

/** The design underlines this phrase of the last timeline step. */
const ONE_SHIPPING = "یک هزینه ارسال";

const emphasise = (text: string): ReactNode => {
	const parts = text.split(ONE_SHIPPING);
	return parts.map((part, i) => (
		<Fragment key={i}>
			{i > 0 && <u>{ONE_SHIPPING}</u>}
			{part}
		</Fragment>
	));
};

type ReserveBoxProps = {
	reservation: CartReservation;
	consolidation?: ReservationConsolidation | null;
};

/**
 * `.reserve` — the optional «رزرو ۴ روزه» switch (off until the shopper turns it on); the timeline slides open
 * while it's on. With an active reservation the switch gives way to the joining message (contract 1.2.0).
 */
export default function ReserveBox({ reservation, consolidation }: ReserveBoxProps) {
	const queryClient = useQueryClient();
	const days = toPersianDigits(reservation.holdDays);

	const setReserve = useMutation({
		mutationFn: (enabled: boolean) => withMappedError(() => CartEndpoints.setReservation(enabled)),
		onSuccess: (_cart, enabled) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			if (enabled) toast(`رزرو ${days} روزه فعال شد`, { icon: "timer" });
		},
		onError: (e) => {
			// the cart changed under the switch (an item that can't be reserved, a reservation elsewhere) — show why
			if (isReservationUnavailableError(e)) queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast(e.description, { type: isReservationUnavailableError(e) ? "warning" : "error" });
		},
	});

	if (reservation.unavailableReason === "HAS_ACTIVE_RESERVATION")
		return (
			<div className="reserve" id="reserve">
				<div className="top">
					<span className="ic">
						<Icon name="timer" />
					</span>
					<div>
						<h3>{consolidation ? `به سفارش رزروی ${consolidation.reservedOrderCode} اضافه می‌شه` : `رزرو ${days} روزه‌ات فعاله`}</h3>
						<p>
							{consolidation?.message ??
								"اگه این خرید رو به همون آدرس سفارش رزروی‌ات بفرستی، خودکار به اون اضافه می‌شه و هزینه ارسال نداره؛ به آدرس دیگه عادی ارسال می‌شه."}
						</p>
					</div>
				</div>
			</div>
		);

	const notReservable = reservation.unavailableReason === "ITEM_NOT_RESERVABLE";
	const on = !notReservable && (setReserve.isPending ? setReserve.variables : reservation.enabled);

	return (
		<div className={classNames("reserve", { on })} id="reserve">
			<div className="top">
				<span className="ic">
					<Icon name="timer" />
				</span>
				<div>
					<h3>رزرو {days} روزه</h3>
					<p>{notReservable ? "یکی از کالاهای سبدت قابل رزرو نیست؛ این سفارش عادی ارسال می‌شه." : `الان کامل پرداخت کن، ${days} روز بعد برات ارسال می‌شه.`}</p>
				</div>
				<label className="switch" aria-label="فعال‌سازی رزرو" style={notReservable ? { opacity: 0.5 } : undefined}>
					<input
						type="checkbox"
						id="resSw"
						checked={on}
						disabled={notReservable || setReserve.isPending}
						onChange={(e) => setReserve.mutate(e.target.checked)}
					/>
					<span className="track" />
				</label>
			</div>
			<div className="more">
				<div>
					<div className="res-tl">
						{reservation.timeline?.map((step) => (
							<div key={step.title}>
								<b>{step.title}</b>
								{emphasise(step.text)}
							</div>
						))}
					</div>
					<p style={{ fontSize: 12.5, color: "#6b5a48", marginTop: 12 }}>
						مثلاً می‌خوای این کیف رو تا تموم نشده بخری، ولی منتظر موجود شدن یه محصول دیگه هم هستی. با رزرو، همه رو یکجا تحویل می‌گیری.
					</p>
				</div>
			</div>
		</div>
	);
}
