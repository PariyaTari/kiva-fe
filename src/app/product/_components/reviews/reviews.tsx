"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import classNames from "classnames";
import { UseQueryResult } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Stars from "@/app/_components/shop/stars/stars";
import { useAuthStore } from "@/store/auth.store";
import { ResultError } from "@/types/result";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { ReviewListResponse } from "../../_types/product.type";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import ReviewForm from "../reviewForm/reviewForm";

type ReviewsProps = {
	productId: number;
	slug: string;
	reviews: UseQueryResult<ReviewListResponse, ResultError>;
};

/** «نظرات» tab — rating summary + form (or the login nudge) beside the list. */
export default function Reviews({ productId, slug, reviews }: ReviewsProps) {
	const user = useAuthStore((s) => (s.accessToken ? s.user : null));

	if (reviews.isLoading) return <Loading />;

	const reviewsError = toErrorView(ERROR_BEHAVIOUR, reviews.error, "دریافت نظرات با خطا مواجه شد.");
	if (reviewsError)
		return (
			<ErrorComponent
				retryable={reviewsError.retryable}
				ticketAble={reviewsError.ticketAble}
				errorText={reviewsError.errorText}
				executeFunction={() => reviews.refetch()}
				loading={reviews.isFetching}
			/>
		);

	if (!reviews.data) return null;
	const { summary, items } = reviews.data;

	return (
		<div className="rv">
			<div className="rv-sum card">
				<div className="rv-avg">
					<b>{toPersianDigits(summary.average.toFixed(1))}</b>
					<div>
						<div className="stars" style={{ display: "flex", color: "#E2A93B" }}>
							<Stars value={summary.average} starStyle={{ fill: "currentColor" }} />
						</div>
						<small className="muted">از {toPersianDigits(summary.count)} نظر ثبت‌شده</small>
					</div>
				</div>
				<div className="bars">
					{summary.distribution.map((d) => (
						<div key={d.stars} className="bar">
							<span>{toPersianDigits(d.stars)} ★</span>
							<i style={{ "--w": `${d.percent}%` } as CSSProperties} />
							<span>{toPersianDigits(d.count)}</span>
						</div>
					))}
				</div>
				<div className="divider" />
				{user ? (
					<ReviewForm key={user.id} productId={productId} user={user} />
				) : (
					<div className="rv-lock">
						<div className="art">
							<BagArt type="wallet" color="lilac" variant={2} />
						</div>
						<b>تو هم نظرت رو بنویس</b>
						<p className="muted" style={{ fontSize: 13, margin: "6px 0 14px" }}>
							برای ثبت نظر، با شماره موبایل وارد شو.
						</p>
						<Link className="btn btn-primary btn-block" href={`/login?next=${encodeURIComponent(`/product/${slug}`)}`}>
							ورود و ثبت نظر
						</Link>
					</div>
				)}
			</div>
			<div>
				{items.map((r) => (
					<div key={r.id} className="rv-item">
						<div className="h">
							<span className="av">{r.authorInitial ?? r.authorName[0] ?? "ک"}</span>
							<span>
								<b>{r.authorName}</b>
								<small>{formatDate(r.createdAt)}</small>
							</span>
							{r.isMine && r.status !== "APPROVED" ? (
								<span className={classNames("tag", r.status === "REJECTED" ? "tag-danger" : "tag-warn")}>{r.statusLabel ?? "در انتظار تأیید"}</span>
							) : r.isVerifiedBuyer ? (
								<span className="tag tag-success buyer">خریدار</span>
							) : null}
							<span className="stars">
								<Stars value={r.rating} />
							</span>
						</div>
						<p>{r.text}</p>
						{r.reply && (
							<div className="reply">
								<b>
									<Icon name="chat" width={14} height={14} /> پاسخ کیوا
								</b>
								{r.reply.text}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
