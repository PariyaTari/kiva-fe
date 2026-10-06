"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { BlogEndpoints } from "../../_api/blogEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import { postHref } from "../postCard/postCard";

/** «مقاله‌های مرتبط» — three `.rp` cards, same category first. */
export default function RelatedPosts({ postId }: { postId: number }) {
	const related = useQuery({
		queryKey: ["blog", "post", postId, "related"],
		queryFn: () => withMappedError(() => BlogEndpoints.getRelated(postId, 3)),
		meta: { showNotificationOnRefetch: true },
	});

	const relatedError = toErrorView(ERROR_BEHAVIOUR, related.error, "دریافت مقاله‌های مرتبط با خطا مواجه شد.");
	if (!relatedError && !related.data?.length) return null;

	return (
		<section className="section">
			<div className="container">
				<div className="sec-head">
					<div>
						<span className="eyebrow">
							<Icon name="feather" /> بیشتر بخون
						</span>
						<h2>مقاله‌های مرتبط</h2>
					</div>
					<Link className="more" href="/blog">
						همه مقاله‌ها <Icon name="arrow" />
					</Link>
				</div>
				{relatedError ? (
					<ErrorComponent
						retryable={relatedError.retryable}
						ticketAble={relatedError.ticketAble}
						errorText={relatedError.errorText}
						executeFunction={() => related.refetch()}
						loading={related.isFetching}
					/>
				) : (
					<div className="rel-posts" id="rel">
						{related.data?.map((p, i) => (
							<Reveal key={p.id} as={Link} className="rp" delay={i ? i * 0.07 : undefined} href={postHref(p)}>
								<div className="cv" style={p.coverBackground ? { background: p.coverBackground } : undefined}>
									<MediaImage src={p.cover?.url} alt={p.cover?.alt ?? p.title} cover />
								</div>
								<small>
									{p.category?.name} · {toPersianDigits(p.readingMinutes)} دقیقه
								</small>
								<h3>{p.title}</h3>
							</Reveal>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
