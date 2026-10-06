import Link from "next/link";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { BlogPostSummary } from "../../_types/blog.type";

export const postHref = (post: Pick<BlogPostSummary, "slug" | "id">) => `/blog/${post.slug || post.id}`;

/** `a.post` — cover with the category tag, date / reading time, title and a two-line excerpt. */
export default function PostCard({ post, delay }: { post: BlogPostSummary; delay?: number }) {
	return (
		<Reveal as={Link} className="post" delay={delay} href={postHref(post)}>
			<div className="cv" style={post.coverBackground ? { background: post.coverBackground } : undefined}>
				<MediaImage src={post.cover?.url} alt={post.cover?.alt ?? post.title} cover />
				<span className="tag tag-glass">{post.category?.name}</span>
			</div>
			<div className="meta">
				<span>
					<Icon name="cal" />
					{formatDate(post.publishedAt)}
				</span>
				<span>
					<Icon name="clock" />
					{toPersianDigits(post.readingMinutes)} دقیقه
				</span>
			</div>
			<h3>{post.title}</h3>
			<p>{post.excerpt}</p>
		</Reveal>
	);
}
