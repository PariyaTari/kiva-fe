import "./_styles/faq.css";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { pageMetadata } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { FaqEndpoints } from "./_api/faqEndpoints";
import FaqView from "./_components/faqView/faqView";

export const metadata = pageMetadata({
	title: "سوالات متداول",
	description: "جواب رایج‌ترین سوال‌ها درباره سفارش، ارسال، رزرو ۴ روزه، بازگشت کالا و عکس قبل از ارسال در کیوا.",
	path: "/faq",
});

// the HTML is rebuilt at most every 5 minutes (the browser re-reads the list anyway)
export const revalidate = 300;

/** FAQ — design `faq.html`; `/faq#reserve` (shipping, return…) opens that group. The whole list is prefetched for the HTML. */
export default async function FaqPage() {
	const client = getServerQueryClient();
	// same key as the whole-list query of `FaqView`
	await client.prefetchQuery({ queryKey: ["faq", ""], queryFn: () => withMappedError(() => FaqEndpoints.getFaq("")) });

	return (
		<div className="pg-faq">
			<main>
				<PrefetchBoundary client={client}>
					<FaqView />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
