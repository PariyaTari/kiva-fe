import { absoluteUrl, SITE_NAME } from "@/utils/seo";
import { BlogPostDetail } from "../_types/blog.type";

/** schema.org `BlogPosting` for a post — used when the API sends no `seo.jsonLd` of its own. */
export function postJsonLd(post: BlogPostDetail, url: string) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt,
		url,
		mainEntityOfPage: url,
		image: post.cover?.url ? [absoluteUrl(post.cover.url)] : undefined,
		datePublished: post.publishedAt,
		dateModified: post.updatedAt ?? post.publishedAt,
		articleSection: post.category?.name,
		keywords: post.tags?.length ? post.tags.join("، ") : undefined,
		author: post.author ? { "@type": "Person", name: post.author.name } : { "@type": "Organization", name: SITE_NAME },
		publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo/kiva-logo-primary.svg") } },
	};
}
