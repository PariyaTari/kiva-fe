import "./_styles/notFound.css";
import Link from "next/link";
import type { Metadata } from "next";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Button from "@/app/_components/ui/button/button";
import { Icon } from "@/app/_components/icon/icons";
import DocumentTitle from "@/app/_components/common/documentTitle/documentTitle";
import NotFoundSearch from "@/app/_components/common/notFoundSearch/notFoundSearch";

/** Design `404.html` — «صفحه پیدا نشد | کیوا» (the root layout adds « | کیوا»). */
const TITLE = "صفحه پیدا نشد";

export const metadata: Metadata = {
	title: TITLE,
};

const LINKS = [
	{ label: "فروشگاه", href: "/products" },
	{ label: "تخفیف‌دارها", href: "/products?onSale=true" },
	{ label: "پیگیری سفارش", href: "/track" },
	{ label: "سوالات متداول", href: "/faq" },
];

/** 404 — design `404.html`. */
export default function NotFound() {
	return (
		<div className="pg-404">
			{/* a missing product / post is found out on the client (`notFound()`), where `metadata` doesn't re-run */}
			<DocumentTitle title={`${TITLE} | کیوا`} />
			<main className="nf">
				<div className="container">
					<div className="big" aria-label="۴۰۴">
						<span>۴</span>
						<span className="o">
							<BagArt type="bucket" color="lilac" />
						</span>
						<span>۴</span>
					</div>
					<h1>این کیف رو پیدا نکردیم!</h1>
					<p>شاید آدرس اشتباه تایپ شده یا این صفحه جابه‌جا شده. ولی کلی کیف قشنگ دیگه منتظرته.</p>
					<div className="acts">
						<Button href="/" size="lg" iconStart={<Icon name="home" />}>
							صفحه اصلی
						</Button>
						<NotFoundSearch />
					</div>
					<div className="links">
						{LINKS.map((l) => (
							<Link key={l.href} className="chip" href={l.href}>
								{l.label}
							</Link>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
