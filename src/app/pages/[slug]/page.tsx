import "../_styles/staticPage.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { safeDecode } from "@/utils/route";
import { pageMetadata, plainText } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { PagesEndpoints } from "../_api/pagesEndpoints";
import StaticPageView from "../_components/staticPageView/staticPageView";
import { StaticPage } from "../_types/staticPage.type";

type StaticPageProps = { params: Promise<{ slug: string }> };

// CMS text rarely changes: the HTML is rebuilt at most every 10 minutes (the browser re-reads the page anyway)
export const revalidate = 600;

/** None at build time: each page is rendered on its first visit, then cached (and rebuilt) like the rest. */
export function generateStaticParams() {
	return [];
}

/** Server prefetch for the HTML — same key as `StaticPageView`. A missing page is the site's 404, with a real 404 status. */
async function loadPage(slug: string) {
	const client = getServerQueryClient();
	const queryKey = ["pages", "detail", slug];
	await client.prefetchQuery({ queryKey, queryFn: () => withMappedError(() => PagesEndpoints.getPage(slug)) });
	if (client.getQueryState(queryKey)?.error?.statusCode === 404) notFound();
	return { client, page: client.getQueryData<StaticPage>(queryKey) };
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
	const slug = safeDecode((await params).slug);
	const { page } = await loadPage(slug);
	// API down: a plain title; the browser still loads the page
	if (!page) return { title: "کیوا" };
	return pageMetadata({ seo: page.seo, title: page.title, description: plainText(page.content), path: `/pages/${slug}` });
}

/** CMS page — terms & privacy (`/pages/terms`, the checkout's `termsUrl`), return policy, … No design file: design-system parts only. */
export default async function StaticPageRoute({ params }: StaticPageProps) {
	const slug = safeDecode((await params).slug);
	const { client } = await loadPage(slug);

	return (
		<div className="pg-static">
			<main>
				<PrefetchBoundary client={client}>
					<StaticPageView slug={slug} />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
