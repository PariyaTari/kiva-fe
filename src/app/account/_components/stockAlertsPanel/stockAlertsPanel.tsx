"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Button from "@/app/_components/ui/button/button";
import { ProductEndpoints } from "@/app/product/_api/productEndpoints";
import { toast } from "@/store/notification.store";
import { StockAlert } from "@/types/stockAlert.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isStockAlertAnswer } from "../../_utils/apiError";
import StockAlertCard from "../stockAlertCard/stockAlertCard";

/**
 * «موجود شد خبرم کن» — the product page's back-in-stock subscriptions (`/me/stock-alerts`). Not in the design:
 * built from the panel parts of `account.html` (the «نظرات من» card, `.empty`).
 */
export default function StockAlertsPanel() {
	const queryClient = useQueryClient();

	const alerts = useQuery({
		queryKey: ["me", "stock-alerts"],
		queryFn: () => withMappedError(() => AccountEndpoints.getStockAlerts()),
		meta: { showNotificationOnRefetch: true },
	});

	// «برگردون» of the cancel toast — subscribes the same bag and colour again
	const restore = useMutation({
		mutationFn: (alert: StockAlert) => withMappedError(() => ProductEndpoints.createStockAlert(alert.product?.id ?? 0, { variantId: alert.variantId ?? null })),
		onSuccess: () => {
			toast("دوباره فعال شد؛ هر وقت موجود شد بهت پیامک می‌دیم", { icon: "bell" });
			return queryClient.invalidateQueries({ queryKey: ["me", "stock-alerts"] });
		},
		// «already on» / «it's in stock now» are answers, not failures (like the product page's button)
		onError: (error) => toast(error.description, { type: isStockAlertAnswer(error) ? "info" : "error", icon: isStockAlertAnswer(error) ? "bell" : undefined }),
	});

	const cancelled = (alert: StockAlert) =>
		toast(`اطلاع‌رسانی «${alert.product?.name ?? "کیف"}» لغو شد`, {
			icon: "bell",
			action: alert.product ? { label: "برگردون", onClick: () => restore.mutate(alert) } : undefined,
		});

	const waiting = alerts.data?.filter((a) => a.status === "ACTIVE").length ?? 0;
	const alertsError = toErrorView(ERROR_BEHAVIOUR, alerts.error, "دریافت اطلاع‌رسانی‌ها با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-alerts">
			<div className="p-head">
				<h2>موجود شد خبرم کن</h2>
				{!!alerts.data?.length && (
					<span className="muted" style={{ fontSize: 13 }}>
						{waiting ? `${toPersianDigits(waiting)} کیف منتظر موجود شدن` : "همه موجود شدن"}
					</span>
				)}
			</div>
			{alerts.isLoading ? (
				<Loading />
			) : !!alertsError ? (
				<ErrorComponent
					retryable={alertsError.retryable}
					ticketAble={alertsError.ticketAble}
					errorText={alertsError.errorText}
					executeFunction={() => alerts.refetch()}
					loading={alerts.isFetching}
				/>
			) : !alerts.error && !!alerts.data ? (
				alerts.data.length ? (
					alerts.data.map((a, i) => <StockAlertCard key={a.id} alert={a} onCancelled={cancelled} delay={Math.min(i, 6) * 0.05} />)
				) : (
					<div className="empty card">
						<div className="art">
							<BagArt type="bucket" color="lilac" variant={2} />
						</div>
						<h4>هنوز منتظر کیفی نیستی</h4>
						<p>کیفی که ناموجوده رو باز کن و «موجود شد خبرم کن» رو بزن؛ همین که برگشت بهت پیامک می‌دیم.</p>
						<Button href="/products" size="sm" style={{ marginTop: 16 }} iconStart={<Icon name="bag" />}>
							رفتن به فروشگاه
						</Button>
					</div>
				)
			) : null}
		</div>
	);
}
