import "./_styles/home.css";
import JsonLd from "@/app/_components/common/jsonLd/jsonLd";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { SITE_CONFIG } from "@/config/site";
import { absoluteUrl, pageMetadata, SITE_NAME } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import HomeView from "./_components/homeView/homeView";
import { loadHomePage } from "./_utils/loadHomePage";

const DESCRIPTION = "کیوا، فروشگاه آنلاین کیف‌های مینیمال. قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم.";

export const metadata = pageMetadata({
	seo: { title: "کیوا | هرچی ببینی، همون می‌رسه" },
	title: SITE_NAME,
	description: DESCRIPTION,
	path: "/",
});

// campaigns and new arrivals change during the day: the HTML is rebuilt at most every minute (the browser re-reads it anyway)
export const revalidate = 60;

/** The store and its search box, for search engines (sitelinks search box). */
const SITE_JSON_LD = [
	{
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE_NAME,
		url: absoluteUrl("/"),
		logo: absoluteUrl("/images/logo/kiva-logo-primary.svg"),
		sameAs: (SITE_CONFIG.social ?? []).map((s) => s.url),
	},
	{
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_NAME,
		url: absoluteUrl("/"),
		potentialAction: {
			"@type": "SearchAction",
			target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/products")}?q={search_term_string}` },
			"query-input": "required name=search_term_string",
		},
	},
];

/** Home — design `index.html`. Prefetched for the HTML with the same loader as `/kiva-configs/home` (same key as `HomeView`), no HTTP hop to itself. */
export default async function HomePage() {
	const client = getServerQueryClient();
	await client.prefetchQuery({ queryKey: ["home", "page"], queryFn: () => withMappedError(() => loadHomePage()) });

	return (
		<div className="pg-home">
			<JsonLd data={SITE_JSON_LD} />
			<main>
				<PrefetchBoundary client={client}>
					<HomeView />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
