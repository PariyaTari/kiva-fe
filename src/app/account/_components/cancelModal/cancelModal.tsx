"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Modal from "@/app/_components/ui/modal/modal";
import { toast } from "@/store/notification.store";
import { CancelOrderResponse, CancelReason, OrderSummary } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { isTooLateError } from "../../_utils/apiError";
import { CANCEL_REASONS, dayShort, itemsLabel, UNPAID } from "../../_utils/orderActions";
import MiniSteps from "../miniSteps/miniSteps";
import ModalHead from "../modalHead/modalHead";

type CancelModalProps = {
	order: OrderSummary;
	open: boolean;
	onClose: () => void;
	/** «درخواست تغییر رنگ یا مدل» instead of cancelling. */
	onRequestChange: () => void;
};

const NOTE_MAX = 500;
/** Reasons after which changing the colour / model is offered instead (when the order allows it). */
const CHANGE_INSTEAD: CancelReason[] = ["NOT_AS_PICTURED", "CHANGED_MIND"];

/** Cancel before shipping with a reason (`POST /me/orders/{code}/cancel`) — design `order-cancel.html`. */
export default function CancelModal({ order, open, onClose, onRequestChange }: CancelModalProps) {
	const queryClient = useQueryClient();
	const paid = !UNPAID.includes(order.status);
	const [reason, setReason] = useState<CancelReason | null>(null);
	const [note, setNote] = useState("");
	const [reasonError, setReasonError] = useState(0);
	const [noteError, setNoteError] = useState<string | null>(null);
	const [result, setResult] = useState<{ view: "done"; res: CancelOrderResponse } | { view: "late" } | null>(null);

	// only for the card mask in the refund line — the sentence reads fine without it
	const detail = useQuery({
		queryKey: ["me", "orders", "detail", order.code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(order.code)),
		enabled: open && paid,
	});
	const cardMask = detail.data?.payment?.cardMask;

	const refreshOrders = () => {
		queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
		queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
	};

	const cancel = useMutation({
		mutationFn: (picked: CancelReason) => withMappedError(() => AccountEndpoints.cancelOrder(order.code, { reason: picked, note: note.trim() || null })),
		onSuccess: (res) => {
			refreshOrders();
			setResult({ view: "done", res });
		},
		onError: (e) => {
			// shipped meanwhile — tell it in the modal and show the new state behind it
			if (isTooLateError(e)) {
				refreshOrders();
				return setResult({ view: "late" });
			}
			const noteDetail = e.errorDetails?.find((d) => d.field === "note");
			if (noteDetail) return setNoteError(noteDetail.message);
			toast(e.description, { type: "error" });
		},
	});

	const submit = () => {
		if (!reason) return setReasonError((n) => n + 1);
		if (reason === "OTHER" && note.trim().length < 5) {
			setNoteError("توضیح بده چرا لغو می‌کنی");
			return document.getElementById(`cNote-${order.code}`)?.focus();
		}
		cancel.mutate(reason);
	};

	const reasons = CANCEL_REASONS.filter((r) => r.key !== "NOT_AS_PICTURED" || !!order.preShipmentMedia?.count);
	const suggestChange = !!order.actions?.canRequestChange && !!reason && CHANGE_INSTEAD.includes(reason);
	const amount = formatPrice(order.payable);
	const mask = cardMask ? (
		<span className="ltr" style={{ display: "inline-block" }}>
			{toPersianDigits(cardMask)}
		</span>
	) : null;

	return (
		<Modal open={open} onClose={onClose} width={580}>
			<div className={classNames("mv", { in: !!result })} key={result?.view ?? "form"}>
				{result?.view === "done" ? (
					<div className="m-done">
						<div className="ck">
							<Icon name="check" />
						</div>
						<h3>سفارش لغو شد</h3>
						<p>
							{result.res.refund
								? `سفارش ${order.code} لغو شد و ${formatPrice(result.res.refund.amount)} تومان حداکثر تا ۷۲ ساعت به کارتت برمی‌گرده؛ پیامکش رو هم برات فرستادیم.`
								: `سفارش ${order.code} لغو شد. پرداختی نداشت، پس چیزی از حسابت کم نشده.`}
						</p>
						{result.res.refund && (
							<div style={{ margin: "24px 0 4px" }}>
								<MiniSteps
									steps={[
										{ label: "لغو شد", at: "امروز" },
										{ label: "برگشت وجه", at: "در حال انجام" },
										{ label: "واریز به کارت", at: result.res.refund.expectedBy ? `تا ${dayShort(result.res.refund.expectedBy)}` : undefined },
									]}
									current={1}
									icons={["ban", "refresh", "card"]}
								/>
							</div>
						)}
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								باشه
							</button>
							<Link className="btn btn-outline btn-block" href="/products">
								ادامه خرید
							</Link>
						</div>
					</div>
				) : result?.view === "late" ? (
					<div className="m-done">
						<div className="ck danger">
							<Icon name="truck" />
						</div>
						<h3>دیگه نمی‌شه لغوش کرد</h3>
						<p>
							سفارش {order.code} همین الان تحویل {order.shippingMethod.name} شد. بعد از تحویل، اگه کیف رو نخواستی، تا ۷ روز می‌تونی درخواست مرجوعی بدی.
						</p>
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								باشه
							</button>
						</div>
					</div>
				) : (
					<>
						<ModalHead
							icon="ban"
							tone="danger"
							title={`لغو سفارش ${order.code}`}
							sub={paid ? "تا قبل از ارسال می‌تونی لغوش کنی و مبلغ کامل بهت برمی‌گرده." : "این سفارش هنوز پرداخت نشده؛ با لغو، کیف‌ها به فروشگاه برمی‌گردن."}
						/>
						<div className="m-items">
							<span className="ths">
								{order.itemsPreview.slice(0, 4).map((item, i) => (
									<span key={`${item.productId}-${i}`}>
										<MediaImage src={item.imageUrl} alt={item.name} />
									</span>
								))}
							</span>
							<span>
								<b>{itemsLabel(order)}</b>
								<small>
									ثبت: {dayShort(order.placedAt)} · {order.statusLabel}
								</small>
							</span>
							<span className="p">
								{amount} <small className="muted">تومان</small>
							</span>
						</div>
						{paid && (
							<div className="rf">
								<Icon name="card" />
								<span>
									<b>{amount} تومان برمی‌گرده</b>
									<small>به همون کارتی که باهاش پرداخت کردی{mask && <> ({mask})</>}، حداکثر تا ۷۲ ساعت بعد از لغو.</small>
								</span>
							</div>
						)}
						<div className="m-sec">
							<div className="m-lb">
								چرا لغو می‌کنی؟ <small>کمکمون می‌کنه کیوا بهتر بشه</small>
							</div>
							<div key={reasonError} className={classNames("rc-list", { shake: reasonError > 0 })}>
								{reasons.map((r) => (
									<label key={r.key} className="rc">
										<input
											type="radio"
											name={`rsn-${order.code}`}
											value={r.key}
											checked={reason === r.key}
											onChange={() => {
												setReason(r.key);
												setReasonError(0);
											}}
										/>
										<span>{r.label}</span>
									</label>
								))}
							</div>
							<div className={classNames("note cream m-err", { on: suggestChange })} style={{ marginTop: 12 }}>
								<Icon name="palette" />
								<span>
									اگه رنگ یا مدلش رو نپسندیدی، لازم نیست لغوش کنی؛ قبل از ارسال می‌تونی عوضش کنی.{" "}
									<button type="button" className="btn-link" onClick={onRequestChange}>
										درخواست تغییر رنگ یا مدل
									</button>
								</span>
							</div>
						</div>
						<div className={classNames("m-sec field", { error: !!noteError })}>
							<label htmlFor={`cNote-${order.code}`}>
								توضیح بیشتر <span className="opt">{reason === "OTHER" ? "(لازم)" : "(اختیاری)"}</span>
							</label>
							<textarea
								className="textarea"
								id={`cNote-${order.code}`}
								maxLength={NOTE_MAX}
								style={{ minHeight: 84 }}
								placeholder="اگه چیزی هست که باید بدونیم، بنویس…"
								value={note}
								onChange={(e) => {
									setNote(e.target.value);
									setNoteError(null);
								}}
							/>
							<div className={classNames("tcount", { over: note.length > NOTE_MAX })}>
								<span className="err">{noteError}</span>
								<span>
									{toPersianDigits(note.length)}/{toPersianDigits(NOTE_MAX)}
								</span>
							</div>
						</div>
						<div className={classNames("note danger m-err", { on: reasonError > 0 })}>
							<Icon name="alert" />
							<span>یه دلیل انتخاب کن تا سفارش رو لغو کنیم.</span>
						</div>
						<div className="m-foot">
							<button type="button" className="btn btn-outline" onClick={onClose}>
								نه، منصرف شدم
							</button>
							<button type="button" className={classNames("btn btn-danger", { loading: cancel.isPending })} onClick={submit}>
								<Icon name="ban" /> لغو سفارش
							</button>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}
