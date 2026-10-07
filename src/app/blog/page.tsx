import "./_styles/blog.css";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { pageMetadata } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { BlogEndpoints } from "./_api/blogEndpoints";
import BlogView from "./_components/blogView/blogView";
import { PAGE_SIZE } from "./_utils/blogList";

export const metadata = pageMetadata({
	title: "بلاگ",
	description: "مجله کیوا — راهنمای خرید، نگهداری از کیف، استایل و پشت صحنه‌ی کیوا.",
	path: "/blog",
});

// the HTML is rebuilt at most every 5 minutes (the browser re-reads the list anyway)
export const revalidate = 300;

/** Blog — design `blog.html`. The chips and the first page are prefetched for the HTML (same keys as `BlogView`). */
export default async function BlogPage() {
	const client = getServerQueryClient();
	await Promise.all([
		client.prefetchQuery({ queryKey: ["blog", "categories"], queryFn: () => withMappedError(() => BlogEndpoints.getCategories()) }),
		client.prefetchQuery({
			queryKey: ["blog", "posts", { category: null, q: "", page: 1 }],
			queryFn: () => withMappedError(() => BlogEndpoints.getPosts({ q: "", page: 1, size: PAGE_SIZE })),
		}),
	]);

	return (
		<div className="pg-blog">
			<main>
				<PrefetchBoundary client={client}>
					<BlogView />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
