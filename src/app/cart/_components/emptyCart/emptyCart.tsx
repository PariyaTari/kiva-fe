"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import ProductCardSkeleton from "@/app/_components/shop/productCard/productCardSkeleton";
import { ProductsEndpoints } from "@/app/products/_api/productsEndpoints";
import { EMPTY_FILTERS } from "@/app/products/_utils/filters";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const BESTSELLERS = 4;

/** Empty cart — the design's nudge plus the four best sellers that are in stock. */
export default function EmptyCart() {
	const bestsellers = useQuery({
		queryKey: ["products", "list", { ...EMPTY_FILTERS, inStock: true, sort: "bestselling", size: BESTSELLERS }],
		queryFn: () =>
			withMappedError(() =>
				ProductsEndpoints.listProducts({ ...EMPTY_FILTERS, inStock: true, sort: "bestselling", page: 1, size: BESTSELLERS, includeFacets: false }),
			),
	});

	const bestsellersError = toErrorView(ERROR_BEHAVIOUR, bestsellers.error, "دریافت پرفروش‌ها با خطا مواجه شد.");

	return (
		<>
			<div className="empty-cart">
				<div className="art float">
					<BagArt type="tote" color="lilac" variant={2} />
				</div>
				<h2>سبد خریدت خالیه</h2>
				<p>هنوز چیزی اضافه نکردی. یه سر به فروشگاه بزن؛ کیف‌ها منتظرتن!</p>
				<Link className="btn btn-primary btn-lg" href="/products">
					رفتن به فروشگاه <Icon name="arrow" />
				</Link>
			</div>
			<section className="section-sm">
				<div className="sec-head">
					<h2>پرفروش‌های کیوا</h2>
				</div>
				{bestsellers.isLoading ? (
					<div className="p-grid">
						{Array.from({ length: BESTSELLERS }, (_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				) : bestsellersError ? (
					<ErrorComponent
						retryable={bestsellersError.retryable}
						ticketAble={bestsellersError.ticketAble}
						errorText={bestsellersError.errorText}
						executeFunction={() => bestsellers.refetch()}
						loading={bestsellers.isFetching}
					/>
				) : bestsellers.data ? (
					<div className="p-grid">
						{bestsellers.data.items.map((p, i) => (
							<ProductCard key={p.id} product={p} delay={i * 0.06} />
						))}
					</div>
				) : null}
			</section>
		</>
	);
}
