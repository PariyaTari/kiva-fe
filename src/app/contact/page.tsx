import "./_styles/contact.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ContactView from "./_components/contactView/contactView";

export const metadata: Metadata = {
	title: "تماس با ما",
};

/** Contact — design `contact.html`. `?topic=OTHER` (the error block's «گزارش به پشتیبانی») preselects the topic. */
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
	const { topic } = await searchParams;

	return (
		<div className="pg-contact">
			<main>
				<section className="page-hero">
					<div className="container hero-row">
						<div>
							<nav className="crumbs" aria-label="مسیر">
								<Link href="/">خانه</Link>
								<Icon name="left" />
								<span>تماس با ما</span>
							</nav>
							<h1>با ما در ارتباط باش</h1>
							<p>سؤالی درباره کیف‌ها، سفارش یا ارسال داری؟ ما همین‌جاییم؛ معمولاً کمتر از یک ساعت جواب می‌دیم.</p>
						</div>
						<div className="art float">
							<BagArt type="cross" color="purple" variant={2} />
						</div>
					</div>
				</section>

				<ContactView initialTopic={typeof topic === "string" ? topic.toUpperCase() : undefined} />
			</main>
		</div>
	);
}
