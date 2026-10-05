"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import ProductCardSkeleton from "@/app/_components/shop/productCard/productCardSkeleton";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const LIMIT = 8;

/** «محصولات مشابه» — same category first, then best sellers. */
export default function RelatedProducts({ productId }: { productId: number }) {
	const related = useQuery({
		queryKey: ["product", productId, "related"],
		queryFn: () => withMappedError(() => ProductEndpoints.getRelated(productId, LIMIT)),
	});

	const relatedError = toErrorView(ERROR_BEHAVIOUR, related.error, "دریافت محصولات مشابه با خطا مواجه شد.");

	// nothing similar → the whole section goes, like an empty shelf in the design would
	if (related.data && !related.data.length) return null;

	return (
		<section className="section">
			<div className="container">
				<div className="sec-head">
					<div>
						<span className="eyebrow">
							<Icon name="sparkle" /> شاید دوست داشته باشی
						</span>
						<h2>محصولات مشابه</h2>
					</div>
					<Link className="more" href="/products">
						همه محصولات <Icon name="arrow" />
					</Link>
				</div>
				{related.isLoading ? (
					<div className="h-scroll" id="related">
						{Array.from({ length: 4 }, (_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				) : relatedError ? (
					<ErrorComponent
						retryable={relatedError.retryable}
						ticketAble={relatedError.ticketAble}
						errorText={relatedError.errorText}
						executeFunction={() => related.refetch()}
						loading={related.isFetching}
					/>
				) : related.data ? (
					<div className="h-scroll" id="related">
						{related.data.map((p, i) => (
							<ProductCard key={p.id} product={p} delay={(i % 4) * 0.06} />
						))}
					</div>
				) : null}
			</div>
		</section>
	);
}
