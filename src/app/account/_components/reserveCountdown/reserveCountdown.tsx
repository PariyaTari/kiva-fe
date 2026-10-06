"use client";

import { useEffect, useState } from "react";
import { toPersianDigits } from "@/utils/digits";

/** `.cd` of the reserve bar — «۲ روز و ۱۴ ساعت و ۵ دقیقه مانده», refreshed every 30 s like the design. */
export default function ReserveCountdown({ expiresAt }: { expiresAt: string }) {
	// rendered only after the orders query answered on the client, so reading the clock here is safe
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 30000);
		return () => clearInterval(timer);
	}, []);

	let s = Math.max(0, (new Date(expiresAt).getTime() - now) / 1000);
	const d = Math.floor(s / 86400);
	s %= 86400;
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);

	return (
		<span className="cd">
			{toPersianDigits(d)} روز و {toPersianDigits(h)} ساعت و {toPersianDigits(m)} دقیقه مانده
		</span>
	);
}
