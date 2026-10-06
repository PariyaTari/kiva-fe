import "../_styles/blogPost.css";
import type { Metadata } from "next";
import PostView from "../_components/postView/postView";

export const metadata: Metadata = {
	title: "مقاله",
};

/** Blog post — design `blog-post.html` (`/blog/{slug}`; an id works too). */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return (
		<div className="pg-blog-post">
			<main>
				<PostView slug={safeDecode(slug)} />
			</main>
		</div>
	);
}

/** Route params can arrive still percent-encoded (non-Latin slugs); a stray `%` must not crash the page. */
function safeDecode(value: string) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
