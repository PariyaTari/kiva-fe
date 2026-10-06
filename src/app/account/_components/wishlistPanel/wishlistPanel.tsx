"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { WishlistEndpoints } from "@/app/wishlist/_api/wishlistEndpoints";
import { ERROR_BEHAVIOUR } from "@/app/wishlist/_utils/apiError";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import ProductCardSkeleton from "@/app/_components/shop/productCard/productCardSkeleton";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";

/** `#p-wishlist` — saved bags as cards (a heart tap removes one; the list re-reads through `["wishlist"]`). */
export default function WishlistPanel() {
	const wishlist = useQuery({
		queryKey: ["wishlist", "list", { page: 1, size: 48 }],
		queryFn: () => withMappedError(() => WishlistEndpoints.getWishlist(1, 48)),
		meta: { showNotificationOnRefetch: true },
	});

	const wishlistError = toErrorView(ERROR_BEHAVIOUR, wishlist.error, "دریافت علاقه‌مندی‌ها با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-wishlist">
			<div className="p-head">
				<h2>علاقه‌مندی‌ها</h2>
				<Link className="btn-link" href="/wishlist">
					صفحه کامل علاقه‌مندی‌ها
				</Link>
			</div>
			{wishlist.isLoading ? (
				<div className="p-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
					{[0, 1, 2].map((i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			) : !!wishlistError ? (
				<ErrorComponent
					retryable={wishlistError.retryable}
					ticketAble={wishlistError.ticketAble}
					errorText={wishlistError.errorText}
					executeFunction={() => wishlist.refetch()}
					loading={wishlist.isFetching}
				/>
			) : !wishlist.error && !!wishlist.data ? (
				wishlist.data.items.length ? (
					<div className="p-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
						{wishlist.data.items.map((item, i) => (
							<ProductCard key={item.product.id} product={item.product} colorKey={item.preferredColorKey} delay={i * 0.05} />
						))}
					</div>
				) : (
					<div className="empty card">
						<div className="art">
							<BagArt type="hobo" color="lilac" variant={2} />
						</div>
						<h4>لیست علاقه‌مندی‌هات خالیه</h4>
						<p>روی ♡ هر کیفی بزنی، این‌جا ذخیره می‌شه.</p>
					</div>
				)
			) : null}
		</div>
	);
}
