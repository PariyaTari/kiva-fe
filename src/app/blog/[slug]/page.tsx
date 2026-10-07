import "../_styles/blogPost.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/_components/common/jsonLd/jsonLd";
import PrefetchBoundary from "@/app/_components/common/prefetchBoundary/prefetchBoundary";
import { safeDecode } from "@/utils/route";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/utils/seo";
import { getServerQueryClient } from "@/utils/serverQuery";
import { withMappedError } from "@/utils/withMappedError";
import { BlogEndpoints } from "../_api/blogEndpoints";
import PostView from "../_components/postView/postView";
import { BlogPostDetail } from "../_types/blog.type";
import { postJsonLd } from "../_utils/postJsonLd";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

// the HTML is rebuilt at most every 5 minutes (the browser re-reads the post anyway)
export const revalidate = 300;

/** None at build time: each post is rendered on its first visit, then cached (and rebuilt) like the rest. */
export function generateStaticParams() {
	return [];
}

/** Server prefetch for the HTML — same key as `PostView`. A missing post is the site's 404 with a real 404 status. */
async function loadPost(slug: string) {
	const client = getServerQueryClient();
	const queryKey = ["blog", "post", slug];
	await client.prefetchQuery({ queryKey, queryFn: () => withMappedError(() => BlogEndpoints.getPost(slug)) });
	if (client.getQueryState(queryKey)?.error?.statusCode === 404) notFound();
	return { client, post: client.getQueryData<BlogPostDetail>(queryKey) };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
	const { post } = await loadPost(safeDecode((await params).slug));
	// API down: a plain title; the browser still loads the post
	if (!post) return { title: "مقاله" };
	return pageMetadata({
		// without an API title: «… | بلاگ کیوا», the same tab title `PostView` sets
		seo: { ...post.seo, title: post.seo?.title ?? `${post.title} | بلاگ کیوا` },
		title: post.title,
		description: post.excerpt,
		// by id too — the canonical is always the slug
		path: `/blog/${post.slug}`,
		image: post.cover?.url,
		type: "article",
	});
}

/** Blog post — design `blog-post.html` (`/blog/{slug}`; an id works too). */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const slug = safeDecode((await params).slug);
	const { client, post } = await loadPost(slug);
	const url = post ? (post.seo?.canonicalUrl ?? absoluteUrl(`/blog/${post.slug}`)) : null;
	const crumbs = post?.breadcrumbs ?? [
		{ label: "خانه", url: "/" },
		{ label: "بلاگ", url: "/blog" },
		{ label: post?.title ?? "", url: null },
	];

	return (
		<div className="pg-blog-post">
			{post && url && <JsonLd data={[post.seo?.jsonLd ?? postJsonLd(post, url), breadcrumbJsonLd(crumbs, url)]} />}
			<main>
				<PrefetchBoundary client={client}>
					<PostView slug={slug} />
				</PrefetchBoundary>
			</main>
		</div>
	);
}
