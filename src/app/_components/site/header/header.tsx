"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import Logo from "@/app/_components/common/logo/logo";
import { ThemeToggle } from "@/app/_components/common/theme-toggle/theme-toggle";
import AnnouncementBar from "@/app/_components/site/announcementBar/announcementBar";
import { isNavActive, MAIN_NAV } from "@/app/_components/site/nav";
import { IconBag, IconHeart, IconMenu, IconSearch, IconUser } from "@/app/_components/icon/icons";

const ICON_BTN =
	"relative grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-raised";

type HeaderProps = {
	onOpenMobile: () => void;
};

/** Floating, rounded header: transparent over the page top, frosted glass once the page scrolls. */
export default function Header({ onOpenMobile }: HeaderProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="pointer-events-none fixed inset-x-0 top-0 z-[90]">
			<AnnouncementBar />

			<div className="pt-[var(--nav-gap)]">
				<div className="mx-auto max-w-container px-4 sm:px-6">
					<div
						className={classNames(
							"pointer-events-auto relative flex items-center gap-1.5 rounded-2xl border px-1.5 transition-[height,background-color,border-color,box-shadow] duration-500 ease-kiva lg:gap-6 lg:rounded-[20px] lg:px-3 lg:ps-[22px]",
							scrolled
								? "glass h-[calc(var(--nav-h)-4px)] border-theme-border shadow-[0_16px_40px_-22px_rgba(42,31,61,0.35)]"
								: "h-[var(--nav-h)] border-transparent",
						)}
					>
						<button onClick={onOpenMobile} aria-label="باز کردن منو" className={classNames(ICON_BTN, "lg:hidden")}>
							<IconMenu width={22} height={22} />
						</button>

						<Link href="/" aria-label="کیوا - صفحه اصلی" className="flex shrink-0 items-center">
							<Logo markClassName={classNames("transition-[height] duration-500 ease-kiva", scrolled ? "h-[26px]" : "h-7")} />
						</Link>

						<nav aria-label="منوی اصلی" className="ms-2.5 hidden items-center gap-0.5 lg:flex">
							{MAIN_NAV.map((item) => {
								const active = isNavActive(pathname, item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										aria-current={active ? "page" : undefined}
										className={classNames(
											"rounded-full px-3.5 py-[7px] text-[14.5px] leading-relaxed transition-colors",
											active
												? "bg-brand-subtle font-bold text-brand"
												: "font-medium text-theme-text hover:bg-surface-raised",
										)}
									>
										{item.label}
									</Link>
								);
							})}
						</nav>

						<div className="ms-auto flex items-center gap-1">
							<ThemeToggle />
							<Link href="/products" aria-label="جستجوی محصولات" title="جستجو" className={ICON_BTN}>
								<IconSearch width={22} height={22} />
							</Link>
							<Link
								href="/wishlist"
								aria-label="علاقه‌مندی‌ها"
								title="علاقه‌مندی‌ها"
								className={classNames(ICON_BTN, "hidden lg:grid")}
							>
								<IconHeart width={22} height={22} />
							</Link>
							<Link
								href="/account"
								aria-label="حساب کاربری"
								title="حساب کاربری"
								className={classNames(ICON_BTN, "hidden lg:grid")}
							>
								<IconUser width={22} height={22} />
							</Link>
							<Link href="/cart" aria-label="سبد خرید" title="سبد خرید" className={ICON_BTN}>
								<IconBag width={22} height={22} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
