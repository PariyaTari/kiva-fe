"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { useReveal } from "@/hooks/useReveal";
import { toErrorView } from "@/utils/apiError";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AboutEndpoints } from "../../_api/aboutEndpoints";
import { SiteStats } from "../../_types/about.type";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const DURATION_MS = 1600;

const COUNTERS: { key: keyof SiteStats; suffix: string; label: string }[] = [
	{ key: "happyCustomers", suffix: "+", label: "مشتری راضی" },
	{ key: "preShipmentPhotos", suffix: "+", label: "عکس قبل از ارسال" },
	{ key: "photoMatchSatisfactionPercent", suffix: "٪", label: "رضایت از تطابق با عکس" },
	{ key: "productModels", suffix: "+", label: "مدل کیف" },
];

/** A number that counts up (ease-out cubic) once `start` turns on — the design's `[data-count]`. */
function CountUp({ to, suffix, start }: { to: number; suffix: string; start: boolean }) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!start) return;
		const t0 = performance.now();
		let frame = 0;
		const step = (t: number) => {
			const k = Math.min(1, (t - t0) / DURATION_MS);
			setValue(Math.round(to * (1 - Math.pow(1 - k, 3))));
			if (k < 1) frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, [start, to]);

	return (
		<b>
			{formatPrice(value)}
			{suffix}
		</b>
	);
}

/** `.nums#nums` — the four site counters, counting up when they come into view. */
export default function StatCounters() {
	const [ref, shown] = useReveal<HTMLDivElement>();

	const stats = useQuery({
		queryKey: ["site", "stats"],
		queryFn: () => withMappedError(() => AboutEndpoints.getStats()),
		meta: { showNotificationOnRefetch: true },
	});

	const statsError = toErrorView(ERROR_BEHAVIOUR, stats.error, "دریافت آمار کیوا با خطا مواجه شد.");
	if (statsError)
		return (
			<ErrorComponent
				retryable={statsError.retryable}
				ticketAble={statsError.ticketAble}
				errorText={statsError.errorText}
				executeFunction={() => stats.refetch()}
				loading={stats.isFetching}
			/>
		);

	return (
		<div className={shown ? "nums reveal in" : "nums reveal"} id="nums" ref={ref}>
			{COUNTERS.map((c) => (
				<div key={c.key} className="num">
					<CountUp to={stats.data?.[c.key] ?? 0} suffix={c.suffix} start={shown && !!stats.data} />
					<span>{c.label}</span>
				</div>
			))}
		</div>
	);
}
