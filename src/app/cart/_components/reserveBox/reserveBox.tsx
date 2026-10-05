"use client";

import { Fragment, ReactNode } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { CartReservation } from "@/types/cart.type";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";

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

/** `.reserve` — «رزرو ۴ روزه» switch; the timeline slides open while it's on. */
export default function ReserveBox({ reservation }: { reservation: CartReservation }) {
	const queryClient = useQueryClient();
	const days = toPersianDigits(reservation.holdDays);

	const setReserve = useMutation({
		mutationFn: (enabled: boolean) => withMappedError(() => CartEndpoints.setReservation(enabled)),
		meta: { showNotification: true },
		onSuccess: (_cart, enabled) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			if (enabled) toast(`رزرو ${days} روزه فعال شد`, { icon: "timer" });
		},
	});

	const on = setReserve.isPending ? setReserve.variables : reservation.enabled;

	return (
		<div className={classNames("reserve", { on })} id="reserve">
			<div className="top">
				<span className="ic">
					<Icon name="timer" />
				</span>
				<div>
					<h3>رزرو {days} روزه</h3>
					<p>الان کامل پرداخت کن، {days} روز بعد برات ارسال می‌شه.</p>
				</div>
				<label className="switch" aria-label="فعال‌سازی رزرو">
					<input type="checkbox" id="resSw" checked={on} disabled={setReserve.isPending} onChange={(e) => setReserve.mutate(e.target.checked)} />
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
