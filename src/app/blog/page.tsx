import "./_styles/blog.css";
import type { Metadata } from "next";
import BlogView from "./_components/blogView/blogView";

export const metadata: Metadata = {
	title: "بلاگ",
};

/** Blog — design `blog.html`. */
export default function BlogPage() {
	return (
		<div className="pg-blog">
			<main>
				<BlogView />
			</main>
		</div>
	);
}
