"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import BankLogo from "@/app/_components/shop/bankLogo/bankLogo";
import { SITE_CONFIG } from "@/config/site";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { PaymentGatewayCode } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { formatPrice } from "@/utils/format";
import { createdPaymentOf, isBalancePayment, newIdempotencyKey, redirectToGateway } from "@/utils/payment";
import { withMappedError } from "@/utils/withMappedError";
import { CheckoutEndpoints } from "../../_api/checkoutEndpoints";
import { PaymentResult } from "../../_types/checkout.type";
import { ERROR_BEHAVIOUR, isPaymentNotFoundError } from "../../_utils/apiError";
import CheckoutHero from "../checkoutHero/checkoutHero";
import SuccessModal from "../successModal/successModal";

/** Retry answers after which the shown result is stale (paid meanwhile / stock released) — re-read it. */
const STALE_RESULT_CODES = ["ORDER_ALREADY_PAID", "PAYMENT_EXPIRED"];
/** `PENDING` = the server is still verifying with the bank: ask again every 3 s, for at most 30 s (contract 1.7.0). */
const POLL_EVERY_MS = 3000;
const POLL_FOR_MS = 30000;
/** Order states that mean «paid» — a failed attempt of a paid order lost to another attempt (the bank returns its money). */
const UNPAID_ORDER = ["PENDING_PAYMENT", "PAYMENT_FAILED", "EXPIRED", "CANCELLED"];

/** Why this attempt can't be paid again — the order moved on (expired, cancelled, paid by another attempt). */
function closedText(order: NonNullable<PaymentResult["order"]>) {
	const code = <b style={{ direction: "ltr", display: "inline-block" }}>{order.code}</b>;
	if (order.status === "EXPIRED") return <>مهلت پرداخت سفارش {code} تموم شد و کیف‌هاش به فروشگاه برگشتن.</>;
	if (order.status === "CANCELLED") return <>سفارش {code} لغو شد.</>;
	if (order.status && !UNPAID_ORDER.includes(order.status))
		return <>سفارش {code} با یه پرداخت دیگه پرداخت شده؛ اگه از این تراکنش هم مبلغی کم شده باشه، بانک خودش برش می‌گردونه.</>;
	return <>سفارش {code} هنوز پرداخت نشده؛ وضعیتش رو توی «سفارش‌های من» ببین.</>;
}

/**
 * `/checkout/result?paymentId=…` — where the bank sends the shopper back. Paid → the design's success
 * (done steps, confetti, modal); still verifying → asks again for a while; otherwise the reason and «پرداخت مجدد»
 * (with another gateway when this one is off) while the order can still be paid.
 */
export default function PaymentResultView() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("paymentId");
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	/** One `Idempotency-Key` per (transaction, gateway) — a resend after a lost response gets the same new transaction. */
	const keys = useRef<Record<string, string>>({});
	const [redirecting, setRedirecting] = useState(false);
	/** Gateways that answered «not available» — the picker shows up and leaves them out. */
	const [off, setOff] = useState<PaymentGatewayCode[]>([]);
	const [gatewayPick, setGatewayPick] = useState<PaymentGatewayCode | null>(null);
	/** The order used its 10 payment attempts (`429`) — the server's sentence instead of «پرداخت مجدد». */
	const [noMoreTries, setNoMoreTries] = useState<string | null>(null);
	/** When the first `PENDING` answer came — the polling window starts there. */
	const [pendingSince, setPendingSince] = useState<number | null>(null);
	// a retry whose bank didn't answer moves the page to its new transaction — that one starts fresh
	const [shownPayment, setShownPayment] = useState(paymentId);
	if (shownPayment !== paymentId) {
		setShownPayment(paymentId);
		setPendingSince(null);
		setNoMoreTries(null);
	}

	useEffect(() => {
		if (hydrated && !signedIn) router.replace(`/login?next=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`);
	}, [hydrated, signedIn, pathname, searchParams, router]);

	const payment = useQuery({
		queryKey: ["payment", paymentId],
		queryFn: () => withMappedError(() => CheckoutEndpoints.getPayment(paymentId ?? "")),
		enabled: hydrated && signedIn && !!paymentId,
		meta: { showNotificationOnRefetch: true },
		// verify is still running — ask again until it settles or the window ends (then the server finishes it on its own)
		refetchInterval: (query) =>
			query.state.data?.status === "PENDING" && (pendingSince === null || query.state.dataUpdatedAt - pendingSince < POLL_FOR_MS) ? POLL_EVERY_MS : false,
		// bounded (≤ 10 requests); the shopper often comes back from the bank app with this tab in the background
		refetchIntervalInBackground: true,
	});

	// shared with the shell; the design's three gateways until it answers
	const config = useQuery({
		queryKey: ["site", "config"],
		queryFn: () => withMappedError(() => SiteEndpoints.getConfig()),
	});

	const data = payment.data;
	if (data?.status === "PENDING" && pendingSince === null) setPendingSince(payment.dataUpdatedAt);

	const gateways = (config.data?.paymentGateways ?? SITE_CONFIG.paymentGateways ?? []).map((g) => (off.includes(g.code) ? { ...g, available: false } : g));
	const usable = gateways.filter((g) => g.available !== false);
	const gateway = usable.find((g) => g.code === gatewayPick) ?? usable.find((g) => g.code === data?.gateway) ?? usable[0];

	const retry = useMutation({
		mutationFn: ({ id, gateway }: { id: string; gateway?: PaymentGatewayCode }) => {
			const key = (keys.current[`${id}:${gateway ?? ""}`] ??= newIdempotencyKey());
			return withMappedError(() => CheckoutEndpoints.retryPayment(id, key, gateway));
		},
		onSuccess: (init) => {
			setRedirecting(true);
			redirectToGateway(init.redirect);
		},
		onError: (e, { gateway: tried }) => {
			if (STALE_RESULT_CODES.includes(e.code)) {
				payment.refetch();
				return toast(e.description, { type: "warning" });
			}
			// a new transaction was made but the bank didn't answer — carry on from that one
			const created = createdPaymentOf(e);
			if (created) {
				toast(e.description || "درگاه پرداخت جواب نداد؛ دوباره امتحان کن.", { type: "warning" });
				return router.replace(`${pathname}?paymentId=${encodeURIComponent(created.paymentId)}`);
			}
			// this gateway is off — offer the others
			if (e.code === "PAYMENT_GATEWAY_UNAVAILABLE") {
				const code = tried ?? data?.gateway;
				if (code) setOff((list) => [...list, code]);
				return toast(e.description || "این درگاه الان در دسترس نیست؛ با یه درگاه دیگه پرداخت کن.", { type: "warning" });
			}
			if (e.code === "RATE_LIMITED") return setNoMoreTries(e.description);
			toast(e.description, { type: "error" });
		},
	});

	const notFound = !paymentId || isPaymentNotFoundError(payment.error);
	const paid = !payment.error && data?.status === "SUCCEEDED";
	const verifying = data?.status === "PENDING" && (pendingSince === null || payment.dataUpdatedAt - pendingSince < POLL_FOR_MS);
	const paymentError = notFound ? null : toErrorView(ERROR_BEHAVIOUR, payment.error, "دریافت نتیجه‌ی پرداخت با خطا مواجه شد.");
	/** This attempt failed but the order is paid (another attempt won) — «سفارش‌های من», not the shop. */
	const orderPaid = !!data?.order?.status && !UNPAID_ORDER.includes(data.order.status);

	return (
		<>
			<CheckoutHero stage={paid ? "paid" : "payment"} />
			<div className="container" id="coRoot">
				{paymentId && (!hydrated || !signedIn || payment.isLoading) ? (
					<Loading />
				) : notFound ? (
					// the bank's callback found no transaction (or the link lost its id) — the order's own state tells the truth
					<div className="empty" style={{ padding: "80px 0" }}>
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>نتیجه‌ی این پرداخت پیدا نشد</h4>
						<p style={{ marginBottom: 18 }}>وضعیت سفارشت رو توی «سفارش‌های من» ببین؛ اگه پرداخت انجام شده باشه، اون‌جا «در حال آماده‌سازی»ه.</p>
						<Link className="btn btn-primary" href="/account/orders">
							سفارش‌های من
						</Link>
					</div>
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
					<SuccessModal
						orderCode={data.order?.code ?? ""}
						nextSteps={data.nextSteps ?? []}
						title={isBalancePayment(data.paymentId) ? "مابه‌التفاوت سفارشت پرداخت شد!" : undefined}
						onClose={() => router.push("/account/orders")}
					/>
				) : data.status === "PENDING" ? (
					<div className="empty" style={{ padding: "80px 0" }}>
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						{verifying ? (
							<>
								<h4>در حال بررسی پرداخت…</h4>
								<p style={{ marginBottom: 18 }}>بانک هنوز نتیجه‌ی تراکنش رو اعلام نکرده؛ چند ثانیه صبر کن، خودش به‌روز می‌شه.</p>
								<Loading text="در حال گرفتن نتیجه از بانک" />
							</>
						) : (
							<>
								<h4>نتیجه‌ی پرداخت هنوز نیومده</h4>
								<p style={{ marginBottom: 18 }}>
									نگران نباش؛ این پرداخت رو خودمون با بانک پیگیری می‌کنیم و نتیجه‌ش توی «سفارش‌های من» دیده می‌شه. اگه پرداخت انجام نشده باشه، مبلغی از حسابت کم
									نمی‌شه.
								</p>
								<div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
									<Link className="btn btn-primary" href="/account/orders">
										سفارش‌های من
									</Link>
									<button type="button" className={classNames("btn btn-outline", { loading: payment.isFetching })} onClick={() => payment.refetch()}>
										<Icon name="refresh" /> بررسی دوباره
									</button>
								</div>
							</>
						)}
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
								{data.canRetry ? (
									<>
										سفارش <b style={{ direction: "ltr", display: "inline-block" }}>{data.order.code}</b> هنوز منتظر پرداخت {formatPrice(data.amount)} تومانه.
									</>
								) : (
									closedText(data.order)
								)}
							</p>
						)}
						{data.canRetry && noMoreTries && (
							<div className="note cream" style={{ maxWidth: 520, margin: "0 auto 18px", textAlign: "right" }}>
								<Icon name="info" />
								<span>{noMoreTries}</span>
							</div>
						)}
						{/* the gateway of this attempt answered «not available» — pay with another one */}
						{data.canRetry && !noMoreTries && off.length > 0 && (
							<div className="pay-opts" style={{ maxWidth: 520, margin: "0 auto 18px" }}>
								{gateways.map((g) => (
									<label key={g.code} className="opt-card" style={g.available === false ? { opacity: 0.55, cursor: "not-allowed" } : undefined}>
										<input
											type="radio"
											name="pay"
											value={g.code}
											checked={gateway?.code === g.code}
											disabled={g.available === false}
											onChange={() => setGatewayPick(g.code)}
										/>
										<span className="radio" />
										<BankLogo gateway={g} />
										<span className="t">{g.name}</span>
									</label>
								))}
							</div>
						)}
						<div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
							{data.canRetry && !noMoreTries && (
								<button
									type="button"
									className={classNames("btn btn-primary", { loading: retry.isPending || redirecting })}
									disabled={off.length > 0 && !gateway}
									// the same gateway goes without `gateway` (the server keeps this attempt's one)
									onClick={() => retry.mutate({ id: data.paymentId, gateway: off.length > 0 ? gateway?.code : undefined })}
								>
									<Icon name="lock" /> پرداخت مجدد
								</button>
							)}
							<Link className="btn btn-outline" href={data.canRetry || orderPaid ? "/account/orders" : "/products"}>
								{data.canRetry || orderPaid ? "سفارش‌های من" : "رفتن به فروشگاه"}
							</Link>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
