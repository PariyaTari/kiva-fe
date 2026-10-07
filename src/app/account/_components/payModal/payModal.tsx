"use client";

import { useRef, useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import BankLogo from "@/app/_components/shop/bankLogo/bankLogo";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Modal from "@/app/_components/ui/modal/modal";
import { FALLBACK_CONFIG } from "@/config/site";
import { toast } from "@/store/notification.store";
import { OrderSummary, PaymentGatewayCode, PaymentInit } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { newIdempotencyKey, redirectToGateway } from "@/utils/payment";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isGatewayUnavailableError, isOrderAlreadyPaidError, isPaymentExpiredError } from "../../_utils/apiError";
import { itemsLabel } from "../../_utils/orderActions";
import ModalHead from "../modalHead/modalHead";
import ReorderButton from "../reorderButton/reorderButton";

type PayModalProps = {
	order: OrderSummary;
	open: boolean;
	onClose: () => void;
};

type View = "form" | "redirect" | "paid" | "expired";

/**
 * Pay an unpaid order from «سفارش‌های من» (`POST /me/orders/{code}/payments`) — design `order-pay.html`.
 * The bank sends the shopper back to `/checkout/result?paymentId=…`, like checkout.
 */
export default function PayModal({ order, open, onClose }: PayModalProps) {
	const queryClient = useQueryClient();
	const [view, setView] = useState<View>("form");
	const [gatewayPick, setGatewayPick] = useState<PaymentGatewayCode | null>(null);
	/** Gateways that answered «not available» during this visit. */
	const [off, setOff] = useState<PaymentGatewayCode[]>([]);
	const [gatewayError, setGatewayError] = useState<string | null>(null);
	const [shake, setShake] = useState(0);
	const [init, setInit] = useState<PaymentInit | null>(null);
	/** One `Idempotency-Key` per gateway — a resend after a lost response gets the same transaction. */
	const keys = useRef<Partial<Record<PaymentGatewayCode, string>>>({});

	// items and totals of the summary
	const detail = useQuery({
		queryKey: ["me", "orders", "detail", order.code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(order.code)),
		enabled: open,
		meta: { showNotificationOnRefetch: true },
	});

	// shared with the shell; the design's three gateways until it answers
	const config = useQuery({
		queryKey: ["site", "config"],
		queryFn: () => withMappedError(() => SiteEndpoints.getConfig()),
	});
	const gateways = (config.data?.paymentGateways ?? FALLBACK_CONFIG.paymentGateways ?? []).map((g) => (off.includes(g.code) ? { ...g, available: false } : g));
	const usable = gateways.filter((g) => g.available !== false);
	const picked = usable.find((g) => g.code === gatewayPick);
	const gateway = picked ?? usable.find((g) => g.isDefault) ?? usable[0];

	const refreshOrders = () => {
		queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
		queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
	};

	const pay = useMutation({
		mutationFn: (code: PaymentGatewayCode) => {
			const key = (keys.current[code] ??= newIdempotencyKey());
			return withMappedError(() => AccountEndpoints.payOrder(order.code, key, code));
		},
		onSuccess: (res) => {
			setInit(res);
			setView("redirect");
			redirectToGateway(res.redirect);
		},
		onError: (e, code) => {
			// the order moved on while the card was open — an answer, not a failure
			if (isOrderAlreadyPaidError(e)) {
				refreshOrders();
				return setView("paid");
			}
			if (isPaymentExpiredError(e)) {
				refreshOrders();
				return setView("expired");
			}
			if (isGatewayUnavailableError(e)) {
				const name = gateways.find((g) => g.code === code)?.name ?? "";
				setOff((list) => [...list, code]);
				setGatewayError(e.description || `درگاه ${name} الان در دسترس نیست؛ با یه درگاه دیگه پرداخت کن.`);
				return setShake((n) => n + 1);
			}
			toast(e.description, { type: "error", duration: 6000, action: { label: "تلاش دوباره", onClick: () => pay.mutate(code) } });
		},
	});

	const detailError = toErrorView(ERROR_BEHAVIOUR, detail.error, "دریافت جزئیات سفارش با خطا مواجه شد.");
	const totals = detail.data?.totals;
	const payable = totals?.payable ?? order.payable;

	return (
		<Modal open={open} onClose={onClose} width={600}>
			{/* a swapped-in view fades up (`.mv.in`), like the design's `m.view` */}
			<div className={classNames("mv", { in: view !== "form" })} key={view}>
				{view === "redirect" && gateway ? (
					<div className="redir">
						<div className="bk">
							<BankLogo gateway={gateway} />
						</div>
						<h3>در حال انتقال به {gateway.name}…</h3>
						<p>
							پرداخت {formatPrice(init?.amount ?? payable)} تومان برای سفارش {order.code}
						</p>
						<p>بعد از پرداخت، به صفحه‌ی نتیجه‌ی پرداخت برمی‌گردی.</p>
						<button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 18 }} onClick={() => init && redirectToGateway(init.redirect)}>
							اگه منتقل نشدی، این‌جا رو بزن
						</button>
					</div>
				) : view === "paid" ? (
					<div className="m-done">
						<div className="ck">
							<Icon name="check" />
						</div>
						<h3>این سفارش قبلاً پرداخت شده</h3>
						<p>پرداخت {order.code} چند لحظه پیش تأیید شد و سفارشت در حال آماده‌سازیه؛ نیازی به پرداخت دوباره نیست.</p>
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								مشاهده سفارش
							</button>
						</div>
					</div>
				) : view === "expired" ? (
					<div className="m-done">
						<div className="ck danger">
							<Icon name="clock" />
						</div>
						<h3>مهلت پرداخت تموم شد</h3>
						<p>کیف‌های این سفارش به فروشگاه برگشتن و دیگه نمی‌شه پرداختش کرد. اگه هنوز می‌خوایشون، دوباره به سبدت اضافه‌شون کن.</p>
						<div className="acts">
							<ReorderButton order={order} className="btn-primary btn-block" onDone={onClose} />
							<button type="button" className="btn btn-outline btn-block" onClick={onClose}>
								بستن
							</button>
						</div>
					</div>
				) : (
					<>
						<ModalHead icon="lock" title="پرداخت سفارش" sub={`${order.code} · ${itemsLabel(order)} · ارسال با ${order.shippingMethod.name}`} />
						{detail.isLoading ? (
							<Loading />
						) : !!detailError ? (
							<ErrorComponent
								retryable={detailError.retryable}
								ticketAble={detailError.ticketAble}
								errorText={detailError.errorText}
								executeFunction={() => detail.refetch()}
								variant="text"
								height={56}
								loading={detail.isFetching}
							/>
						) : !detail.error && !!detail.data && !!totals ? (
							<>
								<div>
									{detail.data.items.map((item) => (
										<div key={item.id} className="mini">
											<span className="th">
												<MediaImage src={item.image?.url} alt={item.image?.alt ?? item.name} />
												{item.quantity > 1 && <em>{toPersianDigits(item.quantity)}</em>}
											</span>
											<span>
												<b>{item.name}</b>
												<small>
													<span className="swatch-dot" style={{ background: item.color.hex }} /> {item.color.name}
												</small>
											</span>
											<span className="p">{formatPrice(item.lineTotal)}</span>
										</div>
									))}
								</div>
								<div style={{ marginTop: 6 }}>
									<div className="sum-row">
										<span>قیمت کالاها</span>
										<b>
											{formatPrice(totals.itemsCompareAtTotal)} <small>تومان</small>
										</b>
									</div>
									{totals.productDiscount > 0 && (
										<div className="sum-row disc">
											<span>تخفیف محصولات</span>
											<b>−{formatPrice(totals.productDiscount)}</b>
										</div>
									)}
									{totals.codeDiscount > 0 && (
										<div className="sum-row disc">
											<span>کد تخفیف</span>
											<b>−{formatPrice(totals.codeDiscount)}</b>
										</div>
									)}
									<div className="sum-row">
										<span>ارسال ({order.shippingMethod.name})</span>
										<b>{totals.shippingCost ? formatPrice(totals.shippingCost) : <span className="free">رایگان</span>}</b>
									</div>
									<div className="sum-row total">
										<span>مبلغ قابل پرداخت</span>
										<b>
											{formatPrice(totals.payable)} <small>تومان</small>
										</b>
									</div>
								</div>
							</>
						) : null}
						<div className="m-sec">
							<div className="m-lb">درگاه پرداخت</div>
							<div className="pay-opts">
								{gateways.map((g) => (
									<label key={g.code} className={classNames("opt-card", { off: g.available === false })}>
										<input
											type="radio"
											name={`gw-${order.code}`}
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
							{/* keyed by the attempt so the shake replays */}
							<div key={shake} className={classNames("note danger m-err", { on: !!gatewayError, shake: shake > 0 })}>
								<Icon name="alert" />
								<span>{gatewayError}</span>
							</div>
							<div className="note" style={{ marginTop: 12 }}>
								<Icon name="lock" />
								<span>اطلاعات کارت فقط در صفحه امن درگاه بانکی وارد می‌شه و کیوا به اون دسترسی نداره.</span>
							</div>
						</div>
						<div className="m-foot">
							<button type="button" className="btn btn-outline" onClick={onClose}>
								انصراف
							</button>
							<button
								type="button"
								className={classNames("btn btn-primary", { loading: pay.isPending })}
								disabled={!gateway}
								onClick={() => gateway && pay.mutate(gateway.code)}
							>
								<Icon name="lock" /> پرداخت {formatPrice(payable)} تومان
							</button>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}
