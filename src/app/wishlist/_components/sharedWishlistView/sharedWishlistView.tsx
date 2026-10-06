"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";
import { WishlistEndpoints } from "../../_api/wishlistEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

/**
 * Someone's shared list (the link of «کپی لینک لیست»). The design has no page for it, so it reuses the
 * wishlist page's hero, grid and gate — read-only, no account needed.
 */
export default function SharedWishlistView({ token }: { token: string }) {
	const shared = useQuery({
		queryKey: ["wishlist", "shared", token],
		queryFn: () => withMappedError(() => WishlistEndpoints.getShared(token)),
		meta: { showNotificationOnRefetch: true },
	});

	// a revoked / unknown link comes back as a 404 with the server's own message — shown in the error block
	const sharedError = toErrorView(ERROR_BEHAVIOUR, shared.error, "دریافت لیست با خطا مواجه شد.");
	const owner = shared.data?.ownerDisplayName;

	return (
		<>
			<section className="page-hero">
				<div className="container hero-row">
					<div>
						<nav className="crumbs" aria-label="مسیر">
							<Link href="/">خانه</Link>
							<Icon name="left" />
							<span>لیست علاقه‌مندی</span>
						</nav>
						<h1>{owner ? `علاقه‌مندی‌های ${owner}` : "لیست علاقه‌مندی"}</h1>
						<p>کیف‌هایی که دلش رو برده؛ اگه خواستی براش هدیه بخری، از همین‌جا انتخاب کن.</p>
					</div>
					<div className="art float">
						<BagArt type="hobo" color="lilac" variant={2} />
					</div>
				</div>
			</section>
			<div className="container" id="root">
				{shared.isLoading ? (
					<Loading />
				) : !!sharedError ? (
					<div style={{ paddingTop: 36 }}>
						<ErrorComponent
							retryable={sharedError.retryable}
							ticketAble={sharedError.ticketAble}
							errorText={sharedError.errorText}
							executeFunction={() => shared.refetch()}
							loading={shared.isFetching}
						/>
					</div>
				) : !shared.error && !!shared.data ? (
					<div className="p-grid" style={{ marginTop: 36 }}>
						{shared.data.items.map((product, i) => (
							<ProductCard key={product.id} product={product} delay={(i % 4) * 0.06} />
						))}
					</div>
				) : null}
			</div>
		</>
	);
}
