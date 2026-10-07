"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { useAuthStore } from "@/store/auth.store";
import { toErrorView } from "@/utils/apiError";
import { formatPrice } from "@/utils/format";
import { newIdempotencyKey, redirectToGateway } from "@/utils/payment";
import { withMappedError } from "@/utils/withMappedError";
import { CheckoutEndpoints } from "../../_api/checkoutEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import CheckoutHero from "../checkoutHero/checkoutHero";
import SuccessModal from "../successModal/successModal";

/** Retry answers after which the shown result is stale (paid meanwhile / stock released) — re-read it. */
const STALE_RESULT_CODES = ["ORDER_ALREADY_PAID", "PAYMENT_EXPIRED"];

/**
 * `/checkout/result?paymentId=…` — where the bank sends the shopper back. Paid → the design's success
 * (done steps, confetti, modal); otherwise the reason and «پرداخت مجدد» when the order can still be paid.
 */
export default function PaymentResultView() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("paymentId");
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	/** One key per visit — a resend after a lost response gets the same new transaction. */
	const [retryKey] = useState(newIdempotencyKey);
	const [redirecting, setRedirecting] = useState(false);

	useEffect(() => {
		if (hydrated && !signedIn) router.replace(`/login?next=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`);
	}, [hydrated, signedIn, pathname, searchParams, router]);

	const payment = useQuery({
		queryKey: ["payment", paymentId],
		queryFn: () => withMappedError(() => CheckoutEndpoints.getPayment(paymentId ?? "")),
		enabled: hydrated && signedIn && !!paymentId,
		meta: { showNotificationOnRefetch: true },
	});

	const retry = useMutation({
		mutationFn: (id: string) => withMappedError(() => CheckoutEndpoints.retryPayment(id, retryKey)),
		meta: { showNotification: true },
		onSuccess: (init) => {
			setRedirecting(true);
			redirectToGateway(init.redirect);
		},
		onError: (e) => {
			if (STALE_RESULT_CODES.includes(e.code)) payment.refetch();
		},
	});

	const data = payment.data;
	const paid = !payment.error && data?.status === "SUCCEEDED";
	const paymentError = toErrorView(ERROR_BEHAVIOUR, payment.error, "دریافت نتیجه‌ی پرداخت با خطا مواجه شد.");

	return (
		<>
			<CheckoutHero stage={paid ? "paid" : "payment"} />
			<div className="container" id="coRoot">
				{!paymentId ? (
					<div style={{ paddingTop: 36 }}>
						<ErrorComponent retryable={false} ticketAble={false} errorText="لینک نتیجه‌ی پرداخت ناقصه؛ وضعیت سفارشت رو از «سفارش‌های من» ببین." />
					</div>
				) : !hydrated || !signedIn || payment.isLoading ? (
					<Loading />
				) : !!paymentError ? (
					<div style={{ paddingTop: 36 }}>
						<ErrorComponent
							retryable={paymentError.retryable}
							ticketAble={paymentError.ticketAble}
							errorText={paymentError.errorText}
							executeFunction={() => payment.refetch()}
							loading={payment.isFetching}
						/>
					</div>
				) : !data ? null : paid ? (
					<SuccessModal orderCode={data.order?.code ?? ""} nextSteps={data.nextSteps ?? []} onClose={() => router.push("/account/orders")} />
				) : data.status === "PENDING" ? (
					<div className="empty" style={{ padding: "80px 0" }}>
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>در حال بررسی پرداخت…</h4>
						<p style={{ marginBottom: 18 }}>بانک هنوز نتیجه‌ی تراکنش رو اعلام نکرده. چند لحظه بعد دوباره بررسی کن.</p>
						<button type="button" className={payment.isFetching ? "btn btn-primary loading" : "btn btn-primary"} onClick={() => payment.refetch()}>
							<Icon name="refresh" /> بررسی دوباره
						</button>
					</div>
				) : (
					<div className="empty" style={{ padding: "80px 0" }}>
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>پرداخت انجام نشد</h4>
						<p>{data.failureReason || "تراکنش ناموفق بود و مبلغی از حسابت کم نشد."}</p>
						{data.order?.code && (
							<p style={{ marginBottom: 18 }}>
								سفارش <b style={{ direction: "ltr", display: "inline-block" }}>{data.order.code}</b>
								{data.canRetry ? ` هنوز منتظر پرداخت ${formatPrice(data.amount)} تومانه.` : " لغو شد."}
							</p>
						)}
						<div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
							{data.canRetry && (
								<button
									type="button"
									className={retry.isPending || redirecting ? "btn btn-primary loading" : "btn btn-primary"}
									onClick={() => retry.mutate(data.paymentId)}
								>
									<Icon name="lock" /> پرداخت مجدد
								</button>
							)}
							<Link className="btn btn-outline" href={data.canRetry ? "/account/orders" : "/products"}>
								{data.canRetry ? "سفارش‌های من" : "رفتن به فروشگاه"}
							</Link>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
