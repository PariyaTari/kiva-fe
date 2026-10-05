"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import { Announcement } from "@/types/siteConfig.type";

const ROTATE_MS = 4500;
/** How long the leaving message keeps `.out` (design: 700ms). */
const OUT_MS = 700;

/** `.kv-ann` — rotating messages: the current one slides up and out, the next rises in. */
export default function AnnouncementBar({ messages }: { messages: Announcement[] }) {
	const [active, setActive] = useState(0);
	const [leaving, setLeaving] = useState<number | null>(null);
	const activeRef = useRef(0);
	const count = messages.length;

	useEffect(() => {
		if (count < 2) return;
		let outTimer: ReturnType<typeof setTimeout>;
		const id = setInterval(() => {
			const cur = activeRef.current;
			activeRef.current = (cur + 1) % count;
			setLeaving(cur);
			setActive(activeRef.current);
			outTimer = setTimeout(() => setLeaving(null), OUT_MS);
		}, ROTATE_MS);
		return () => {
			clearInterval(id);
			clearTimeout(outTimer);
		};
	}, [count]);

	return (
		<div className="kv-ann">
			<div className="container kv-ann-in">
				<div className="kv-ann-msgs">
					{messages.map((m, i) => (
						<p key={m.id} className={i === active % Math.max(count, 1) ? "on" : i === leaving ? "out" : undefined}>
							<Icon name={m.icon} />
							{m.text}
						</p>
					))}
				</div>
				<Link href="/track">
					<Icon name="box" />
					<span>پیگیری سفارش</span>
				</Link>
			</div>
		</div>
	);
}
