import { CancelReason, OrderDetail, OrderItem, OrderStatus, OrderSummary, Refund, RefundMethod, ReturnReason, ReturnStatus } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";

/** «سه‌شنبه ۱۵ مهر». */
export const dayLong = (t: string | number) => formatDate(t, { weekday: "long", day: "numeric", month: "long" });
/** «۱۵ مهر». */
export const dayShort = (t: string | number) => formatDate(t, { day: "numeric", month: "long" });
/** «۱۴:۵۲». */
export const clockTime = (t: string | number) => formatDate(t, { hour: "2-digit", minute: "2-digit", hour12: false });

/** Order states without the 4-step stepper and the tracking box (design `A.ST` index −1). */
export const NO_PROGRESS: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_FAILED", "EXPIRED", "CANCELLED"];
/** Unpaid orders — their receipt is issued after payment. */
export const UNPAID: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_FAILED"];
/** Paid once — the card offers the purchase receipt; a cancelled order has one too (only paid orders are cancelled). */
export const hasInvoice = (status: OrderStatus) => !UNPAID.includes(status) && status !== "EXPIRED";

/** «کراس‌بادی نیلا» for one bag, «۲ کالا» for more (design `A.itemsLabel`). */
export function itemsLabel(order: Pick<OrderSummary, "itemsPreview" | "itemsCount">) {
	const items = order.itemsPreview;
	if (items.length === 1) return items[0].name;
	return `${toPersianDigits(order.itemsCount ?? items.reduce((n, i) => n + i.quantity, 0))} کالا`;
}

export const CANCEL_REASONS: { key: CancelReason; label: string }[] = [
	{ key: "CHANGED_MIND", label: "نظرم عوض شد" },
	{ key: "NOT_AS_PICTURED", label: "با عکس‌ها فرق داشت" },
	{ key: "ORDERED_BY_MISTAKE", label: "اشتباهی سفارش دادم" },
	{ key: "FOUND_CHEAPER", label: "جای دیگه ارزون‌تر دیدم" },
	{ key: "DELIVERY_TOO_LONG", label: "ارسالش طول می‌کشه" },
	{ key: "OTHER", label: "دلیل دیگه" },
];

/** Who pays the return shipping — `null`: decided after review. */
export type ReturnPayer = "KIVA" | "CUSTOMER" | null;

export const RETURN_REASONS: { key: ReturnReason; label: string; hint: string; payer: ReturnPayer }[] = [
	{ key: "NOT_AS_PICTURED", label: "با عکس قبل از ارسال فرق داشت", hint: "رنگ، جنس یا ظاهرش با عکس‌هایی که دیدی یکی نیست", payer: "KIVA" },
	{ key: "MANUFACTURING_DEFECT", label: "ایراد تولیدی داره", hint: "دوخت، زیپ، یراق یا چرمش ایراد داره", payer: "KIVA" },
	{ key: "WRONG_ITEM", label: "کیف اشتباهی رسید", hint: "مدل یا رنگی که سفارش دادی نیست", payer: "KIVA" },
	{ key: "DAMAGED_IN_TRANSIT", label: "توی راه آسیب دیده", hint: "بسته یا کیف موقع ارسال آسیب دیده", payer: "KIVA" },
	{ key: "CHANGED_MIND", label: "نظرم عوض شد", hint: "کیف سالمه ولی دیگه نمی‌خوامش", payer: "CUSTOMER" },
	{ key: "OTHER", label: "دلیل دیگه", hint: "توی توضیحات بنویس چی شده", payer: "CUSTOMER" },
];

export const PAYER_TAG: Record<"KIVA" | "CUSTOMER" | "null", { tone: string; label: string }> = {
	KIVA: { tone: "tag-success", label: "هزینه برگشت با کیوا" },
	CUSTOMER: { tone: "tag-cream", label: "هزینه برگشت با خودت" },
	null: { tone: "", label: "بعد از بررسی مشخص می‌شه" },
};

/** «… به کارتت / حسابت برمی‌گرده». */
export const REFUND_DESTINATION: Record<RefundMethod, string> = {
	ORIGINAL_PAYMENT: "کارتت",
	BANK_TRANSFER: "حسابت",
};

/** A refund's state for the shopper — refunds are manual (contract 1.12.0); see `refundNeedsCall` for «در انتظار تماس». */
export const REFUND_STATUS: Record<Refund["status"], { tone: string; label: string }> = {
	PENDING: { tone: "tag-warn", label: "در صف واریز" },
	PROCESSING: { tone: "", label: "در حال واریز" },
	COMPLETED: { tone: "tag-success", label: "واریز شد" },
	FAILED: { tone: "tag-danger", label: "انجام نشد" },
};

/**
 * A pending `BANK_TRANSFER` refund waits for a colleague's call for the IBAN — no IBAN is ever stored, a return's refund
 * included (contract 1.21.0). `ORIGINAL_PAYMENT` goes back to the paying card by hand.
 */
export const refundNeedsCall = (r: Refund) => r.status === "PENDING" && r.method === "BANK_TRANSFER";

/** Paid so far minus the refunds that didn't fail — what cancelling the whole order gives back. */
export const refundableTotal = (order: Pick<OrderDetail, "totals" | "refunds">) =>
	Math.max(0, order.totals.payable - (order.refunds ?? []).filter((r) => r.status !== "FAILED").reduce((n, r) => n + r.amount, 0));

/**
 * What dropping one line gives back: its total minus its share of the code discount, rounded down (contract 1.12.0). The backend
 * uses the totals of the moment the order was placed; after an earlier change the current ones make this an estimate.
 */
export const lineRefund = (item: Pick<OrderItem, "lineTotal">, totals: Pick<OrderDetail["totals"], "codeDiscount" | "subtotal">) =>
	item.lineTotal - (totals.subtotal > 0 ? Math.floor((item.lineTotal * totals.codeDiscount) / totals.subtotal) : 0);

/** Return status → tag tone and the step reached on the 4-step strip (design `RS`). */
export const RETURN_STEP: Record<ReturnStatus, { tone: string; step: number }> = {
	REQUESTED: { tone: "tag-warn", step: 1 },
	APPROVED: { tone: "", step: 2 },
	PICKUP_SCHEDULED: { tone: "", step: 2 },
	RECEIVED: { tone: "", step: 3 },
	REFUNDED: { tone: "tag-success", step: 3 },
	REJECTED: { tone: "tag-danger", step: 1 },
	CLOSED: { tone: "", step: 3 },
};
