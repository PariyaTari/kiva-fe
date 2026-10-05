"use client";

import { ComponentType, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import Logo from "@/app/_components/common/logo/logo";
import { svgIcon } from "@/app/_components/icon/icon.types";
import { isNavActive, MAIN_NAV, MOBILE_EXTRA_NAV } from "@/app/_components/site/nav";
import { MessengerKey, SOCIAL_LINKS } from "@/config/site";
import {
	IconBale,
	IconChevronLeft,
	IconClose,
	IconInstagram,
	IconRubika,
	IconTelegram,
} from "@/app/_components/icon/icons";

const SOCIAL_ICONS: Record<MessengerKey, ComponentType<svgIcon>> = {
	rubika: IconRubika,
	bale: IconBale,
	telegram: IconTelegram,
	instagram: IconInstagram,
};

type MobileMenuProps = {
	open: boolean;
	onClose: () => void;
};

/** Below `lg` the main menu and the header shortcuts move into this right-hand drawer. */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
	const pathname = usePathname();

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						key="overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-[110] bg-primary-900/30 backdrop-blur-sm lg:hidden"
					/>
					<motion.aside
						key="drawer"
						aria-label="منو"
						initial={{ x: "105%" }}
						animate={{ x: 0 }}
						exit={{ x: "105%" }}
						transition={{ duration: 0.5, ease: [0.2, 0.75, 0.2, 1] }}
						className="fixed inset-y-0 right-0 z-[120] flex w-[min(420px,92vw)] flex-col rounded-l-3xl bg-surface shadow-kiva-lg lg:hidden"
					>
						<div className="flex items-center justify-between border-b border-theme-border px-[22px] py-5">
							<Link href="/" onClick={onClose} aria-label="کیوا - صفحه اصلی">
								<Logo markClassName="h-[26px]" />
							</Link>
							<button
								onClick={onClose}
								aria-label="بستن منو"
								className="grid h-[42px] w-[42px] place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-raised"
							>
								<IconClose width={22} height={22} />
							</button>
						</div>

						<nav aria-label="منوی موبایل" className="kiva-scroll flex-1 overflow-y-auto px-[22px] py-3">
							{[...MAIN_NAV, ...MOBILE_EXTRA_NAV].map((item) => {
								const active = isNavActive(pathname, item.href);
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={onClose}
										aria-current={active ? "page" : undefined}
										className={classNames(
											"flex items-center gap-3 border-b border-theme-border px-1 py-3.5 text-base font-semibold transition-colors",
											active ? "text-brand" : "text-theme-text hover:text-brand",
										)}
									>
										{Icon && <Icon width={20} height={20} className="shrink-0 text-theme-text-subtle" />}
										<span className="flex-1">{item.label}</span>
										<IconChevronLeft width={18} height={18} className="shrink-0 text-theme-text-subtle" />
									</Link>
								);
							})}
						</nav>

						<div className="flex justify-center gap-2 border-t border-theme-border px-[22px] py-[18px]">
							{SOCIAL_LINKS.map((social) => {
								const Icon = SOCIAL_ICONS[social.key];
								return (
									<a
										key={social.key}
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										title={social.label}
										className="grid h-[46px] w-[46px] place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-raised hover:text-brand"
									>
										<Icon width={26} height={26} />
									</a>
								);
							})}
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
