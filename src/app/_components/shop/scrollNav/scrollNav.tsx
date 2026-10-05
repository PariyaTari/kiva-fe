"use client";

import { RefObject } from "react";
import { Icon } from "@/app/_components/icon/icons";

type ScrollNavProps = {
	/** The `.h-scroll` row it pages through. */
	target: RefObject<HTMLElement | null>;
	/** Share of the row width per click (design: .8, testimonials .9). */
	step?: number;
};

/** `.scroll-nav` — the prev/next circles next to a horizontal row. */
export default function ScrollNav({ target, step = 0.8 }: ScrollNavProps) {
	const scroll = (dir: 1 | -1) => {
		const row = target.current;
		row?.scrollBy({ left: dir * row.clientWidth * step, behavior: "smooth" });
	};

	return (
		<div className="scroll-nav">
			<button type="button" aria-label="قبلی" onClick={() => scroll(1)}>
				<Icon name="right" />
			</button>
			<button type="button" aria-label="بعدی" onClick={() => scroll(-1)}>
				<Icon name="left" />
			</button>
		</div>
	);
}
