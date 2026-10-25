"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { reviewLink } from "@/app/product/_utils/reviewPurchase";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import { dayShort } from "../../_utils/orderActions";

/**
 * «منتظر نظر تو» at the top of «نظرات من» (`GET /me/reviews/pending-products`; not in the design — the `.my-rv` card's head with
 * a «نظر بده» button). One row per delivered bag without a review; «نظر بده» opens its page on the reviews tab with the purchase,
 * so the review gets the «خریدار» tag. Nothing to review → nothing shown.
 */
export default function ReviewablePurchases() {
	const purchases = useQuery({
		queryKey: ["me", "reviews", "pending-products"],
		queryFn: () => withMappedError(() => AccountEndpoints.getReviewablePurchases()),
		meta: { showNotificationOnRefetch: true },
	});

	const purchasesError = toErrorView(ERROR_BEHAVIOUR, purchases.error, "دریافت کیف‌های منتظر نظر با خطا مواجه شد.");

	if (purchasesError)
		return (
			<div style={{ marginBottom: 14 }}>
				<ErrorComponent
					retryable={purchasesError.retryable}
					ticketAble={purchasesError.ticketAble}
					errorText={purchasesError.errorText}
					executeFunction={() => purchases.refetch()}
					height={56}
					loading={purchases.isFetching}
				/>
			</div>
		);

	if (!purchases.data?.length) return null;

	return (
		<section className="rv-wait" aria-labelledby="rvWaitT">
			<h3 id="rvWaitT">
				<Icon name="chat" /> منتظر نظر تو <span className="n">{toPersianDigits(purchases.data.length)}</span>
			</h3>
			<p className="muted">کیف‌هایی که به دستت رسیدن و هنوز درباره‌شون چیزی ننوشتی؛ نظرت به بقیه کمک می‌کنه انتخاب کنن.</p>
			{purchases.data.map((p, i) => (
				<Reveal key={`${p.orderCode}-${p.orderItemId}`} className="my-rv rv-wait-item" delay={Math.min(i, 6) * 0.05}>
					<div className="h">
						<span className="th">
							<MediaImage src={p.product.imageUrl} alt={p.product.name} placeholderColor={p.color.hex} />
						</span>
						<span>
							<b>{p.product.name}</b>
							<small>
								<span className="swatch-dot" style={{ background: p.color.hex }} /> {p.color.name} · تحویل {dayShort(p.deliveredAt)}
							</small>
						</span>
						<Link className="btn btn-soft btn-sm" href={reviewLink(p)}>
							نظر بده <Icon name="arrow" />
						</Link>
					</div>
				</Reveal>
			))}
		</section>
	);
}
