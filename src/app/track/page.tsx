import "./_styles/track.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/app/_components/icon/icons";
import { pageMetadata } from "@/utils/seo";
import DailyCodes from "./_components/dailyCodes/dailyCodes";
import TrackLookup from "./_components/trackLookup/trackLookup";

export const metadata: Metadata = pageMetadata({
	title: "پیگیری سفارش",
	description: "پیگیری سفارش کیوا بدون نیاز به ورود — با شماره سفارش و موبایل؛ به‌همراه کدهای رهگیری روزانه‌ی مرسوله‌ها.",
	path: "/track",
});

/** Order tracking — design `track.html`. `?order=KV-…` (the SMS link) pre-fills the form. */
export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string | string[] }> }) {
	const { order } = await searchParams;

	return (
		<div className="pg-track">
			<main>
				<section className="page-hero">
					<div className="container">
						<nav className="crumbs" aria-label="مسیر">
							<Link href="/">خانه</Link>
							<Icon name="left" />
							<span>پیگیری سفارش</span>
						</nav>
						<h1>سفارشت کجاست؟</h1>
						<p>بدون نیاز به ورود؛ فقط شماره سفارش و موبایلی که باهاش خرید کردی رو وارد کن.</p>
					</div>
				</section>

				<div className="container">
					<TrackLookup initialOrder={typeof order === "string" ? order : ""} />
					<DailyCodes />
				</div>
			</main>
		</div>
	);
}
