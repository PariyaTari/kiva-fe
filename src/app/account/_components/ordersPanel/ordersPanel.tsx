"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { OrderListFilter } from "../../_types/account.type";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import OrderCard from "../orderCard/orderCard";

const FILTERS: { key: OrderListFilter; label: string }[] = [
	{ key: "all", label: "همه" },
	{ key: "current", label: "جاری" },
	{ key: "delivered", label: "تحویل شده" },
];

const PAGE_SIZE = 10;

/** `#p-orders` «سفارش‌های من» — همه / جاری / تحویل شده, newest first. */
export default function OrdersPanel() {
	const [filter, setFilter] = useState<OrderListFilter>("all");

	const orders = useInfiniteQuery({
		queryKey: ["me", "orders", "list", { filter }],
		queryFn: ({ pageParam }) => withMappedError(() => AccountEndpoints.getOrders(filter, pageParam, PAGE_SIZE)),
		initialPageParam: 1,
		getNextPageParam: (last) => (last.meta?.hasNext ? last.meta.page + 1 : undefined),
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	const list = orders.data?.pages.flatMap((p) => p.items) ?? [];
	// a failed «بیشتر» keeps the orders already shown; only a failed first page replaces the list
	const firstPageFailed = !!orders.error && !orders.isFetchNextPageError;
	const ordersError = toErrorView(ERROR_BEHAVIOUR, firstPageFailed ? orders.error : null, "دریافت سفارش‌ها با خطا مواجه شد.");
	const moreError = toErrorView(ERROR_BEHAVIOUR, orders.isFetchNextPageError ? orders.error : null, "دریافت سفارش‌های بیشتر با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-orders">
			<div className="p-head">
				<h2>سفارش‌های من</h2>
				<div className="seg">
					{FILTERS.map((f) => (
						<button key={f.key} type="button" className={classNames({ on: filter === f.key })} onClick={() => setFilter(f.key)}>
							{f.label}
						</button>
					))}
				</div>
			</div>
			{orders.isLoading ? (
				<Loading />
			) : !!ordersError ? (
				<ErrorComponent
					retryable={ordersError.retryable}
					ticketAble={ordersError.ticketAble}
					errorText={ordersError.errorText}
					executeFunction={() => orders.refetch()}
					loading={orders.isFetching}
				/>
			) : !firstPageFailed && !!orders.data ? (
				list.length ? (
					<div style={orders.isPlaceholderData ? { opacity: 0.5, transition: "opacity .2s" } : undefined}>
						{list.map((order) => (
							<OrderCard key={order.code} order={order} />
						))}
						{!!moreError && (
							<ErrorComponent
								retryable={moreError.retryable}
								ticketAble={moreError.ticketAble}
								errorText={moreError.errorText}
								executeFunction={() => orders.fetchNextPage()}
								height={56}
								loading={orders.isFetchingNextPage}
							/>
						)}
						{orders.hasNextPage && !moreError && (
							<div style={{ textAlign: "center" }}>
								<button type="button" className={classNames("btn btn-outline", { loading: orders.isFetchingNextPage })} onClick={() => orders.fetchNextPage()}>
									سفارش‌های بیشتر
								</button>
							</div>
						)}
					</div>
				) : (
					<div className="empty card">
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>سفارشی این‌جا نیست</h4>
						<Link className="btn btn-primary" href="/products" style={{ marginTop: 12 }}>
							شروع خرید
						</Link>
					</div>
				)
			) : null}
		</div>
	);
}
