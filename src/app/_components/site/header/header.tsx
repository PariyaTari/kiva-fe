"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/app/_components/common/logo/logo";
import { Icon } from "@/app/_components/icon/icons";
import AnnouncementBar from "@/app/_components/site/announcementBar/announcementBar";
import MegaMenu from "@/app/_components/site/megaMenu/megaMenu";
import { isNavActive, MAIN_NAV } from "@/app/_components/site/nav";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { WishlistEndpoints } from "@/app/wishlist/_api/wishlistEndpoints";
import { FALLBACK_CONFIG } from "@/config/site";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { SiteConfig } from "@/types/siteConfig.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";

/** `.kv-header` — floating, rounded; frosted once the page scrolls. */
export default function Header({ config }: { config: SiteConfig }) {
	const pathname = usePathname();
	const open = useUiStore((s) => s.open);
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const categories = useQuery({
		queryKey: ["site", "categories"],
		queryFn: () => withMappedError(() => SiteEndpoints.listCategories()),
	});

	// waits for the persisted session so the guest cart token / bearer goes along
	const cart = useQuery({
		queryKey: ["cart"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		enabled: hydrated,
	});

	const wishlistIds = useQuery({
		queryKey: ["wishlist", "ids"],
		queryFn: () => withMappedError(() => WishlistEndpoints.getIds()),
		enabled: hydrated && signedIn,
	});

	const count = cart.data?.totals.itemsCount ?? 0;
	const subtotal = cart.data?.totals.subtotal ?? 0;
	const wishCount = signedIn ? (wishlistIds.data?.count ?? 0) : 0;

	return (
		<header className={classNames("kv-header", { scrolled })} id="kvHeader">
			<AnnouncementBar messages={config.announcements ?? FALLBACK_CONFIG.announcements ?? []} />
			<div className="kv-nav">
				<div className="container">
					<div className="kv-nav-in">
						<button type="button" className="icon-btn kv-burger" aria-label="منو" onClick={() => open("menu")}>
							<Icon name="menu" />
						</button>
						<Link className="kv-logo" href="/" aria-label="کیوا - صفحه اصلی">
							<Logo />
						</Link>
						<nav className="kv-menu" aria-label="منوی اصلی">
							{MAIN_NAV.map((item) =>
								item.mega ? (
									<div className="kv-drop" key={item.href}>
										<Link href={item.href} className={classNames({ active: isNavActive(pathname, item.href) })}>
											{item.label} <Icon name="down" />
										</Link>
										<MegaMenu categories={categories} />
									</div>
								) : (
									<Link key={item.href} href={item.href} className={classNames({ active: isNavActive(pathname, item.href) })}>
										{item.label}
									</Link>
								),
							)}
						</nav>
						<div className="kv-actions">
							<button type="button" className="icon-btn" aria-label="جستجو" onClick={() => open("search")}>
								<Icon name="search" />
							</button>
							<Link className="icon-btn hide-m" href="/wishlist" aria-label="علاقه‌مندی‌ها">
								<Icon name="heart" />
								<span className={classNames("kv-badge", { on: wishCount > 0 })} id="kvWishBadge">
									{toPersianDigits(wishCount)}
								</span>
							</Link>
							<Link
								className="icon-btn hide-m"
								id="kvUserBtn"
								href={signedIn ? "/account" : "/login"}
								aria-label={signedIn ? "حساب کاربری من" : "حساب کاربری"}
							>
								<Icon name="user" />
								{signedIn && <span className="kv-user-dot" />}
							</Link>
							<button
								type="button"
								className={classNames("kv-cart", { has: count > 0 })}
								id="kvCartBtn"
								onClick={() => open("cart")}
								aria-label={count ? `سبد خرید: ${toPersianDigits(count)} کالا، ${formatPrice(subtotal)} تومان` : "سبد خرید خالی است"}
							>
								<span className="ico">
									<Icon name="bag" />
									{/* re-keyed on every count change so the `.bump` animation replays */}
									<span key={count} className={classNames("kv-badge", { on: count > 0, bump: count > 0 })} id="kvCartBadge">
										{toPersianDigits(count)}
									</span>
								</span>
								<span className="kv-cart-total" id="kvCartTotal">
									{count ? (
										<>
											{formatPrice(subtotal)}
											<small>تومان</small>
										</>
									) : null}
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
