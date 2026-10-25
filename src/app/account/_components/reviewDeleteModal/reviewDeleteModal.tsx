"use client";

import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { Review } from "@/types/review.type";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { isReviewMovedOnError } from "../../_utils/apiError";
import ModalHead from "../modalHead/modalHead";

type ReviewDeleteModalBodyProps = {
	review: Review;
	onClose: () => void;
};

/** «حذف نظر» of «نظرات من» (`DELETE /me/reviews/{id}`; not in the design — the cancel modal's head and footer). Can't be undone. */
export default function ReviewDeleteModalBody({ review, onClose }: ReviewDeleteModalBodyProps) {
	const queryClient = useQueryClient();
	const published = review.status === "APPROVED";

	const remove = useMutation({
		mutationFn: () => withMappedError(() => AccountEndpoints.deleteReview(review.id)),
		onSuccess: () => {
			// the list, the side menu's count, and «منتظر نظر تو» (the bag can be reviewed again)
			queryClient.invalidateQueries({ queryKey: ["me", "reviews"] });
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			toast("نظرت حذف شد", { icon: "trash" });
			onClose();
		},
		onError: (e) => {
			// already gone (another tab) — the list catches up
			if (isReviewMovedOnError(e)) {
				queryClient.invalidateQueries({ queryKey: ["me", "reviews"] });
				onClose();
			}
			toast(e.description, { type: isReviewMovedOnError(e) ? "warning" : "error" });
		},
	});

	return (
		<>
			<ModalHead icon="trash" tone="danger" title="نظرت حذف بشه؟" sub={review.product?.name ?? undefined} />
			<p className="muted" style={{ fontSize: 13.5 }}>
				{published
					? "نظرت از صفحه‌ی کیف برداشته می‌شه و از امتیازش کم می‌شه. رأی‌های «به دردت خورد؟» هم پاک می‌شن و برگشت‌پذیر نیست."
					: "نظرت و هر چی بهش مربوطه پاک می‌شه و برگشت‌پذیر نیست."}{" "}
				بعدش هر وقت خواستی می‌تونی برای این کیف نظر تازه بنویسی.
			</p>
			<div className="m-foot">
				<button type="button" className="btn btn-outline" onClick={onClose}>
					نه، بمونه
				</button>
				<button
					type="button"
					className={classNames("btn btn-danger", { loading: remove.isPending })}
					disabled={remove.isPending}
					onClick={() => remove.mutate()}
				>
					<Icon name="trash" /> حذف نظر
				</button>
			</div>
		</>
	);
}
