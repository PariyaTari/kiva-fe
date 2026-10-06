"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { toErrorView } from "@/utils/apiError";
import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

/** `#p-tracking` «کدهای رهگیری من» — the shopper's shipments grouped by the day they left. */
export default function TrackingPanel() {
	const tracking = useQuery({
		queryKey: ["me", "tracking"],
		queryFn: () => withMappedError(() => AccountEndpoints.getTracking()),
		meta: { showNotificationOnRefetch: true },
	});

	const trackingError = toErrorView(ERROR_BEHAVIOUR, tracking.error, "دریافت کدهای رهگیری با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-tracking">
			<div className="p-head">
				<h2>کدهای رهگیری من</h2>
				<Link className="btn btn-soft btn-sm" href="/track#daily">
					کدهای رهگیری روزانه همه سفارش‌ها
				</Link>
			</div>
			{tracking.isLoading ? (
				<Loading />
			) : !!trackingError ? (
				<ErrorComponent
					retryable={trackingError.retryable}
					ticketAble={trackingError.ticketAble}
					errorText={trackingError.errorText}
					executeFunction={() => tracking.refetch()}
					loading={tracking.isFetching}
				/>
			) : !tracking.error && !!tracking.data ? (
				tracking.data.length ? (
					tracking.data.map((day) => (
						<Reveal key={day.date} className="day">
							<div className="day-h">
								<Icon name="cal" /> {day.label}
								<span className="tag">{toPersianDigits(day.shipments.length)} مرسوله</span>
							</div>
							{day.shipments.map((s) => (
								<div key={s.orderCode} className="trow">
									<b style={{ direction: "ltr" }}>{s.orderCode}</b>
									<span className="muted">{s.carrierName}</span>
									<code>{toPersianDigits(s.trackingCode)}</code>
									<span className="acts">
										<button type="button" className="btn btn-soft btn-sm" onClick={() => copyText(s.trackingCode, "کد رهگیری کپی شد")}>
											<Icon name="copy" /> کپی
										</button>
									</span>
								</div>
							))}
						</Reveal>
					))
				) : (
					<div className="empty card">
						<h4>هنوز کد رهگیری‌ای نداری</h4>
						<p>بعد از تحویل سفارش به پست یا تیپاکس، کدش این‌جا نمایش داده می‌شه.</p>
					</div>
				)
			) : null}
		</div>
	);
}
