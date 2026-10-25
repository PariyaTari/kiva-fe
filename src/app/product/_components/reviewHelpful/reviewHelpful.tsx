"use client";

import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { Review } from "@/types/review.type";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";

type ReviewHelpfulProps = {
	review: Review;
	productId: number;
};

/**
 * «این نظر به دردت خورد؟» under a published review (`PUT /reviews/{id}/helpful`; not in the design — the blog's
 * `.helpful` row in a smaller size). Signed-in shoppers only. One toggle: «مفید نبود» isn't counted (contract 1.21.0), so a
 * second press takes the vote back (`helpful: false`) instead of a «نه» button.
 */
export default function ReviewHelpful({ review, productId }: ReviewHelpfulProps) {
	const queryClient = useQueryClient();
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const promptLogin = useUiStore((s) => s.promptLogin);

	const vote = useMutation({
		mutationFn: (helpful: boolean) => withMappedError(() => ProductEndpoints.voteReviewHelpful(review.id, helpful)),
		meta: { showNotification: true },
		// returned: the vote stays pending until the list is re-read, so the shown answer never flips back in between
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", productId, "reviews"] }),
	});

	const saved = review.myHelpfulVote === true;
	// while sending, show the new answer — and its effect on the count (the saved vote is already counted)
	const mine = vote.isPending ? vote.variables === true : saved;
	const count = (review.helpfulCount ?? 0) + (vote.isPending ? Number(mine) - Number(saved) : 0);

	const toggle = () => {
		if (!signedIn) {
			promptLogin("برای اینکه رأیت ثبت بشه، اول وارد حساب کاربریت شو.");
			return;
		}
		if (vote.isPending) return;
		vote.mutate(!saved);
	};

	return (
		<div className="rv-help">
			<span>به دردت خورد؟</span>
			<button
				type="button"
				className={classNames({ on: mine })}
				aria-pressed={mine}
				title={mine ? "برای پس گرفتن رأیت دوباره بزن" : undefined}
				onClick={toggle}
			>
				<Icon name="smile" /> آره
				{count > 0 && <span className="n">{toPersianDigits(count)}</span>}
			</button>
		</div>
	);
}
