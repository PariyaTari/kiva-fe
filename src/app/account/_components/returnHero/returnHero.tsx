import { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";

/** `.page-hero` of the return page — crumbs back to «سفارش‌های من», title and the order line. */
export default function ReturnHero({ children }: { children: ReactNode }) {
	return (
		<section className="page-hero">
			<div className="container">
				<nav className="crumbs" aria-label="مسیر">
					<Link href="/">خانه</Link>
					<Icon name="left" />
					<Link href="/account">حساب کاربری</Link>
					<Icon name="left" />
					<Link href="/account/orders">سفارش‌های من</Link>
					<Icon name="left" />
					<span>درخواست مرجوعی</span>
				</nav>
				<h1>درخواست مرجوعی</h1>
				<p>{children}</p>
			</div>
		</section>
	);
}
