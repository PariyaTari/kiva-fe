import Link from "next/link";
import SiteShell from "@/app/_components/site/shell/shell";
import Button from "@/app/_components/ui/button/button";
import { IconBag, IconHome } from "@/app/_components/icon/icons";

const SUGGESTIONS = [
	{ label: "فروشگاه", href: "/products" },
	{ label: "تخفیف‌دارها", href: "/products?onSale=true" },
	{ label: "پیگیری سفارش", href: "/track" },
	{ label: "سوالات متداول", href: "/faq" },
];

export default function NotFound() {
	return (
		<SiteShell>
			<section className="kiva-step-in mx-auto flex min-h-[78vh] max-w-container flex-col items-center justify-center px-4 pb-10 pt-[calc(var(--site-top)+3rem)] text-center sm:px-6">
				<p className="text-[clamp(5.5rem,16vw,9.5rem)] font-bold leading-none text-brand" aria-label="۴۰۴">
					۴۰۴
				</p>
				<h1 className="mt-6 text-[clamp(1.5rem,3vw,2rem)] font-bold text-theme-heading">این کیف رو پیدا نکردیم!</h1>
				<p className="mt-3 max-w-md leading-8 text-theme-text-muted">
					شاید آدرس اشتباه تایپ شده یا این صفحه جابه‌جا شده. ولی کلی کیف قشنگ دیگه منتظرته.
				</p>

				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Button href="/" size="lg" iconStart={<IconHome width={18} height={18} />}>
						صفحه اصلی
					</Button>
					<Button href="/products" size="lg" variant="white" iconStart={<IconBag width={18} height={18} />}>
						فروشگاه
					</Button>
				</div>

				<div className="mt-7 flex flex-wrap justify-center gap-2">
					{SUGGESTIONS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="inline-flex h-[34px] items-center rounded-full border border-theme-border bg-surface px-3.5 text-[13px] font-medium text-theme-text transition-colors hover:border-theme-heading"
						>
							{item.label}
						</Link>
					))}
				</div>
			</section>
		</SiteShell>
	);
}
