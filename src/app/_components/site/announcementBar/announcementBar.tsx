"use client";

import { ComponentType, useEffect, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { svgIcon } from "@/app/_components/icon/icon.types";
import { IconBox, IconCamera, IconTimer, IconTruck } from "@/app/_components/icon/icons";
import { Announcement, ANNOUNCEMENTS } from "@/config/site";

const ICONS: Record<Announcement["icon"], ComponentType<svgIcon>> = {
	camera: IconCamera,
	truck: IconTruck,
	timer: IconTimer,
};

const ROTATE_MS = 4500;

/** The purple strip above the floating nav: rotating store messages + a shortcut to order tracking. */
export default function AnnouncementBar() {
	const [active, setActive] = useState(0);
	const count = ANNOUNCEMENTS.length;

	useEffect(() => {
		if (count < 2) return;
		const id = window.setInterval(() => setActive((i) => (i + 1) % count), ROTATE_MS);
		return () => window.clearInterval(id);
	}, [count]);

	return (
		<div className="pointer-events-auto h-[var(--ann-h)] overflow-hidden bg-primary-600 text-[11.5px] text-white sm:text-[12.5px]">
			<div className="mx-auto flex h-full max-w-container items-center justify-between gap-4 px-4 sm:px-6">
				<div className="relative h-full min-w-0 flex-1 overflow-hidden">
					{ANNOUNCEMENTS.map((item, i) => {
						const Icon = ICONS[item.icon];
						const isActive = i === active;
						const isLeaving = i === (active - 1 + count) % count && count > 1;
						return (
							<p
								key={item.text}
								aria-hidden={!isActive}
								className={classNames(
									"absolute inset-0 flex items-center gap-2 transition-[opacity,transform] duration-500 ease-kiva",
									isActive
										? "translate-y-0 opacity-100"
										: isLeaving
											? "-translate-y-full opacity-0"
											: "translate-y-full opacity-0",
								)}
							>
								<Icon width={15} height={15} className="shrink-0 opacity-85" />
								<span className="truncate">{item.text}</span>
							</p>
						);
					})}
				</div>

				<Link
					href="/track"
					className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/40 px-3 py-[3px] font-semibold leading-normal transition-colors hover:bg-white/15"
				>
					<IconBox width={14} height={14} />
					<span className="hidden sm:inline">پیگیری سفارش</span>
				</Link>
			</div>
		</div>
	);
}
