"use client";

import { Fragment, useEffect, useState } from "react";
import { pad2 } from "@/utils/format";

type CountdownProps = {
	/** ISO end time of the campaign. */
	endsAt: string;
	/** Server clock at response time — corrects a skewed device clock. */
	serverTime?: string;
	/** When the response was received (`dataUpdatedAt`, ms) — by the Next server for prefetched HTML, else by the browser. */
	receivedAt?: number;
};

const UNITS = ["روز", "ساعت", "دقیقه", "ثانیه"];

function parts(ms: number) {
	let s = Math.max(0, Math.floor(ms / 1000));
	const d = Math.floor(s / 86400);
	s %= 86400;
	const h = Math.floor(s / 3600);
	s %= 3600;
	const m = Math.floor(s / 60);
	return [d, h, m, s % 60];
}

/**
 * `.countdown` — days : hours : minutes : seconds, ticking every second.
 * The first pass shows the time left at `serverTime` — the same on the server (prefetched HTML) and in the
 * browser's hydration pass, which a reading of the device clock would not be; the first tick corrects it.
 */
export default function Countdown({ endsAt, serverTime, receivedAt }: CountdownProps) {
	const end = new Date(endsAt).getTime();
	const sentAt = serverTime ? new Date(serverTime).getTime() : null;
	// the receiving clock's offset from the API's — not "now", since prefetched (cached) HTML may be minutes old
	const skew = sentAt != null && receivedAt ? sentAt - receivedAt : 0;
	/** API-clock "now" — `null` until mounted. */
	const [now, setNow] = useState<number | null>(null);

	useEffect(() => {
		const tick = () => setNow(Date.now() + skew);
		const first = setTimeout(tick);
		const id = setInterval(tick, 1000);
		return () => {
			clearTimeout(first);
			clearInterval(id);
		};
	}, [skew]);

	const values = parts(end - (now ?? sentAt ?? end));

	return (
		<div className="countdown" id="countdown" aria-label="زمان باقی‌مانده">
			{values.map((v, i) => (
				<Fragment key={UNITS[i]}>
					{i > 0 && <span>:</span>}
					<div>
						<b>{pad2(v)}</b>
						<small>{UNITS[i]}</small>
					</div>
				</Fragment>
			))}
		</div>
	);
}
