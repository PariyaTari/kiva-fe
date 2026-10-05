"use client";

import { Fragment, useEffect, useState } from "react";
import { pad2 } from "@/utils/format";

type CountdownProps = {
	/** ISO end time of the campaign. */
	endsAt: string;
	/** Server clock at response time — corrects a skewed device clock. */
	serverTime?: string;
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

/** `.countdown` — days : hours : minutes : seconds, ticking every second. */
export default function Countdown({ endsAt, serverTime }: CountdownProps) {
	const [skew] = useState(() => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0));
	const end = new Date(endsAt).getTime();
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	const values = parts(end - (now + skew));

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
