"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { IconName } from "@/app/_components/icon/icon.types";
import { toPersianDigits } from "@/utils/digits";
import { AccountDashboard } from "../../_types/account.type";

type CountKey = keyof NonNullable<AccountDashboard["navCounts"]>;

/** The design's side menu (`#snav`) — one route per panel instead of `#hash` panels. */
const NAV: { href: string; icon: IconName; label: string; count?: CountKey }[] = [
	{ href: "/account/orders", icon: "box", label: "سفارش‌های من", count: "orders" },
	{ href: "/account/tracking", icon: "truck", label: "کدهای رهگیری" },
	{ href: "/account/addresses", icon: "pin", label: "آدرس‌ها", count: "addresses" },
	{ href: "/account/wishlist", icon: "heart", label: "علاقه‌مندی‌ها", count: "wishlist" },
	// not in the design: the product page's «موجود شد خبرم کن» subscriptions (`/me/stock-alerts`)
	{ href: "/account/stock-alerts", icon: "bell", label: "موجود شد خبرم کن" },
	{ href: "/account/reviews", icon: "chat", label: "نظرات من" },
	{ href: "/account/profile", icon: "user", label: "اطلاعات شخصی" },
];

type AccountNavProps = {
	counts?: AccountDashboard["navCounts"];
	onLogout: () => void;
	loggingOut: boolean;
};

/** `nav.snav` — panels with their counters, and «خروج از حساب». */
export default function AccountNav({ counts, onLogout, loggingOut }: AccountNavProps) {
	const pathname = usePathname();

	return (
		<nav className="snav" id="snav">
			{NAV.map((item) => (
				<Link key={item.href} href={item.href} className={classNames({ on: pathname.startsWith(item.href) })}>
					<Icon name={item.icon} />
					{item.label}
					{item.count && <span className="c">{counts ? toPersianDigits(counts[item.count]) : ""}</span>}
				</Link>
			))}
			<button type="button" className="out" disabled={loggingOut} onClick={onLogout}>
				<Icon name="logout" />
				خروج از حساب
			</button>
		</nav>
	);
}
