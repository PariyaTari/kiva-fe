"use client";

import Link from "next/link";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Stars from "@/app/_components/shop/stars/stars";
import { ReviewStatus } from "@/types/review.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const STATUS: Record<ReviewStatus, { tag: string; label: string }> = {
	APPROVED: { tag: "tag-success", label: "منتشر شده" },
	PENDING: { tag: "tag-warn", label: "در انتظار تأیید" },
	REJECTED: { tag: "tag-danger", label: "رد شده" },
};

/** `#p-reviews` «نظرات من» — status of each review and the admin's reply. */
export default function ReviewsPanel() {
	const reviews = useQuery({
		queryKey: ["me", "reviews", { page: 1, size: 50 }],
		queryFn: () => withMappedError(() => AccountEndpoints.getReviews(1, 50)),
		meta: { showNotificationOnRefetch: true },
	});

	const total = reviews.data?.counts?.total ?? reviews.data?.meta?.totalItems ?? reviews.data?.items.length;
	const reviewsError = toErrorView(ERROR_BEHAVIOUR, reviews.error, "دریافت نظرات با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-reviews">
			<div className="p-head">
				<h2>نظرات من</h2>
				{total !== undefined && (
					<span className="muted" style={{ fontSize: 13 }}>
						{toPersianDigits(total)} نظر ثبت‌شده
					</span>
				)}
			</div>
			{reviews.isLoading ? (
				<Loading />
			) : !!reviewsError ? (
				<ErrorComponent
					retryable={reviewsError.retryable}
					ticketAble={reviewsError.ticketAble}
					errorText={reviewsError.errorText}
					executeFunction={() => reviews.refetch()}
					loading={reviews.isFetching}
				/>
			) : !reviews.error && !!reviews.data ? (
				reviews.data.items.length ? (
					reviews.data.items.map((r) => {
						const status = STATUS[r.status] ?? STATUS.PENDING;
						return (
							<Reveal key={r.id} className="my-rv">
								<div className="h">
									<span className="th">
										<MediaImage src={r.product?.imageUrl} alt={r.product?.name} />
									</span>
									<span>
										<Link href={`/product/${r.product?.slug ?? r.productId}#reviews`}>
											<b>{r.product?.name}</b>
										</Link>
										<small>{formatDate(r.createdAt)}</small>
									</span>
									<span className={classNames("tag", status.tag)}>{r.statusLabel ?? status.label}</span>
								</div>
								<div className="stars">
									<Stars value={r.rating} fillOn />
								</div>
								<p>{r.text}</p>
								{r.reply ? (
									<div className="reply">
										<b>
											<Icon name="chat" /> پاسخ ادمین کیوا
										</b>
										{r.reply.text}
									</div>
								) : r.status === "REJECTED" ? (
									<div className="reply wait">{r.rejectionReason ?? "این نظر منتشر نشد."}</div>
								) : (
									<div className="reply wait">پاسخ ادمین بعد از بررسی نظرت این‌جا نمایش داده می‌شه.</div>
								)}
							</Reveal>
						);
					})
				) : (
					<div className="empty card">
						<h4>هنوز نظری ننوشتی</h4>
						<p>بعد از تحویل سفارش، از صفحه‌ی هر کیف می‌تونی نظرت رو بنویسی.</p>
					</div>
				)
			) : null}
		</div>
	);
}
