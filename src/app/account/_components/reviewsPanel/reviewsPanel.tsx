"use client";

// BACKEND-PENDING(review-edit): only the edit / delete modal state used it
// import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Stars from "@/app/_components/shop/stars/stars";
// BACKEND-PENDING(review-edit)
// import Modal from "@/app/_components/ui/modal/modal";
import { /* BACKEND-PENDING(review-edit): Review, */ ReviewStatus } from "@/types/review.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
// BACKEND-PENDING(review-pending): «منتظر نظر تو» (`GET /me/reviews/pending-products`) is still [پیشنهادی] in the contract (1.22.0) — off until the backend builds it; uncomment to bring it back
// import ReviewablePurchases from "../reviewablePurchases/reviewablePurchases";
// BACKEND-PENDING(review-edit): editing / deleting a review (`PATCH` / `DELETE /me/reviews/{id}`) is still [پیشنهادی] in the contract (1.22.0) — off until the backend builds it; uncomment to bring it back
// import ReviewDeleteModalBody from "../reviewDeleteModal/reviewDeleteModal";
// import ReviewEditModalBody from "../reviewEditModal/reviewEditModal";

const STATUS: Record<ReviewStatus, { tag: string; label: string }> = {
	APPROVED: { tag: "tag-success", label: "منتشر شده" },
	PENDING: { tag: "tag-warn", label: "در انتظار تأیید" },
	REJECTED: { tag: "tag-danger", label: "رد شده" },
};

// BACKEND-PENDING(review-edit): only a pending or rejected review can be edited (`422 REVIEW_NOT_EDITABLE`); an approved one is deleted and written again
// const EDITABLE: ReviewStatus[] = ["PENDING", "REJECTED"];

/**
 * `#p-reviews` «نظرات من» — «منتظر نظر تو» (bags to review), then each review with its status and the admin's reply. Editing and
 * deleting (`PATCH` / `DELETE /me/reviews/{id}`) aren't in the design: the address card's action row and the panel's modals.
 * «منتظر نظر تو», editing and deleting are off while their endpoints are [پیشنهادی] (`BACKEND-PENDING(review-pending|review-edit)`).
 */
export default function ReviewsPanel() {
	// BACKEND-PENDING(review-edit)
	// // `seq` remounts the modal body for each opening (a fresh form)
	// const [modal, setModal] = useState<{ open: boolean; kind: "edit" | "delete"; review?: Review; seq: number }>({ open: false, kind: "edit", seq: 0 });
	// const openModal = (kind: "edit" | "delete", review: Review) => setModal((m) => ({ open: true, kind, review, seq: m.seq + 1 }));
	// const closeModal = () => setModal((m) => ({ ...m, open: false }));

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
			{/* BACKEND-PENDING(review-pending): <ReviewablePurchases /> */}
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
								<p style={{ whiteSpace: "pre-line" }}>{r.text}</p>
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
								{/* BACKEND-PENDING(review-edit):
								<div className="acts">
									{EDITABLE.includes(r.status) && (
										<button type="button" onClick={() => openModal("edit", r)}>
											<Icon name="edit" /> {r.status === "REJECTED" ? "ویرایش و ارسال دوباره" : "ویرایش"}
										</button>
									)}
									<button type="button" className="del" onClick={() => openModal("delete", r)}>
										<Icon name="trash" /> حذف
									</button>
								</div>
								*/}
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
			{/* BACKEND-PENDING(review-edit):
			<Modal open={modal.open} onClose={closeModal} width={modal.kind === "edit" ? 560 : 480}>
				{modal.seq > 0 &&
					modal.review &&
					(modal.kind === "edit" ? (
						<ReviewEditModalBody key={modal.seq} review={modal.review} onClose={closeModal} />
					) : (
						<ReviewDeleteModalBody key={modal.seq} review={modal.review} onClose={closeModal} />
					))}
			</Modal>
			*/}
		</div>
	);
}
