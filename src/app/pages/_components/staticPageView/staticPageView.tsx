"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import Button from "@/app/_components/ui/button/button";
import { toErrorView } from "@/utils/apiError";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { PagesEndpoints } from "../../_api/pagesEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

/** A CMS page (terms, privacy, …): hero with the title and last update, the article card and a support line. */
export default function StaticPageView({ slug }: { slug: string }) {
	// same key as the server prefetch in `pages/[slug]/page.tsx`
	const page = useQuery({
		queryKey: ["pages", "detail", slug],
		queryFn: () => withMappedError(() => PagesEndpoints.getPage(slug)),
		meta: { showNotificationOnRefetch: true },
	});

	// a missing page shows the site's 404 (like a missing post) — the server answers 404 first; this covers client navigation
	if (page.error?.statusCode === 404) notFound();

	const pageError = toErrorView(ERROR_BEHAVIOUR, page.error, "دریافت صفحه با خطا مواجه شد.");
	const data = page.data;

	return (
		<>
			<section className="page-hero">
				<div className="container">
					<nav className="crumbs" aria-label="مسیر">
						<Link href="/">خانه</Link>
						<Icon name="left" />
						<span>{data?.title ?? "…"}</span>
					</nav>
					<h1>{data?.title ?? " "}</h1>
					{data?.updatedAt && (
						<p>
							<Icon name="clock" /> آخرین به‌روزرسانی: {formatDate(data.updatedAt, { year: "numeric", month: "long", day: "numeric" })}
						</p>
					)}
				</div>
			</section>

			<div className="container">
				<article className="sp-card">
					{page.isLoading ? (
						<Loading />
					) : pageError ? (
						<ErrorComponent
							retryable={pageError.retryable}
							ticketAble={pageError.ticketAble}
							errorText={pageError.errorText}
							executeFunction={() => page.refetch()}
							loading={page.isFetching}
						/>
					) : !page.error && data ? (
						<div className="prose" dangerouslySetInnerHTML={{ __html: data.content }} />
					) : null}
				</article>

				<div className="sp-help">
					<div>
						<b>سؤالی درباره این شرایط داری؟</b>
						<small>پشتیبانی کیوا هر روز جواب می‌ده؛ جواب خیلی از سؤال‌ها هم توی سوالات متداول هست.</small>
					</div>
					<Button href="/contact" variant="white" iconStart={<Icon name="headset" />}>
						تماس با پشتیبانی
					</Button>
				</div>
			</div>
		</>
	);
}
