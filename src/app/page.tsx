import SiteShell from "@/app/_components/site/shell/shell";
import Button from "@/app/_components/ui/button/button";
import Card from "@/app/_components/ui/card/card";
import { IconArrowLeft, IconBox, IconCamera, IconTimer, IconTruck } from "@/app/_components/icon/icons";

/** The three store promises — they become `SiteConfig.productPerks` once `/config` is wired in. */
const PERKS = [
	{
		icon: IconCamera,
		title: "عکس قبل از ارسال",
		text: "قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس و ویدیو می‌فرستیم.",
	},
	{
		icon: IconTruck,
		title: "ارسال رایگان",
		text: "برای خریدهای بالای ۳٬۰۰۰٬۰۰۰ تومان با پست معمولی.",
	},
	{
		icon: IconTimer,
		title: "رزرو ۴ روزه",
		text: "الان کامل پرداخت کن، چند روز بعد همه رو یکجا تحویل بگیر.",
	},
];

export default function HomePage() {
	return (
		<SiteShell>
			{/* Hero — runs under the floating header, so it offsets its own top by --site-top */}
			<section className="relative overflow-hidden rounded-b-[32px] bg-brand-subtle">
				<div
					className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(closest-side,#000_30%,transparent_100%)]"
					aria-hidden
				/>
				<div className="relative mx-auto flex min-h-[min(640px,100svh)] max-w-container flex-col items-center justify-center px-4 pb-20 pt-[calc(var(--site-top)+2.5rem)] text-center sm:px-6">
					<div className="kiva-step-in flex max-w-2xl flex-col items-center">
						<span className="inline-flex items-center gap-2 rounded-full border border-primary-400 bg-white/70 px-3.5 py-1.5 text-[12.5px] font-bold text-primary-800 dark:border-theme-border-strong dark:bg-surface dark:text-brand">
							<IconCamera width={15} height={15} />
							امضای کیوا: عکس قبل از ارسال
						</span>

						<h1 className="mt-6 text-[clamp(2.5rem,5.2vw,4.4rem)] font-bold leading-[1.28] text-theme-heading">
							هرچی ببینی،
							<br />
							<em className="not-italic text-brand">همون</em> می‌رسه.
						</h1>

						<p className="mt-5 max-w-xl text-[16.5px] leading-[2.05] text-theme-text-muted">
							قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس و ویدیو می‌گیریم و توی روبیکا، تلگرام یا
							بله برات می‌فرستیم. بدون غافلگیری.
						</p>

						<div className="mt-8 flex flex-wrap justify-center gap-3">
							<Button
								href="/products"
								size="lg"
								iconEnd={
									<IconArrowLeft
										width={18}
										height={18}
										className="transition-transform duration-300 ease-kiva group-hover:-translate-x-1"
									/>
								}
							>
								مشاهده محصولات
							</Button>
							<Button href="/track" size="lg" variant="white" iconStart={<IconBox width={18} height={18} />}>
								پیگیری سفارش
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Store promises */}
			<section className="mx-auto max-w-container px-4 pt-14 sm:px-6">
				<div className="grid gap-4 sm:grid-cols-3">
					{PERKS.map((perk) => {
						const Icon = perk.icon;
						return (
							<Card key={perk.title} className="flex items-start gap-4">
								<span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-subtle text-brand">
									<Icon width={24} height={24} />
								</span>
								<div>
									<h2 className="text-[15px] font-bold text-theme-heading">{perk.title}</h2>
									<p className="mt-1 text-[13px] leading-6 text-theme-text-muted">{perk.text}</p>
								</div>
							</Card>
						);
					})}
				</div>
			</section>
		</SiteShell>
	);
}
