import { generateID } from "@/utils/generateId";
import { PaymentRedirect } from "@/types/order.type";
import { ResultError } from "@/types/result";

/** Leaves for the bank page: a plain navigation for GET, an auto-submitted form for POST gateways (Saman/Mellat). */
export function redirectToGateway({ url, method, fields }: PaymentRedirect) {
	if (method !== "POST") {
		window.location.assign(url);
		return;
	}
	const form = document.createElement("form");
	form.method = "POST";
	form.action = url;
	form.style.display = "none";
	Object.entries(fields ?? {}).forEach(([name, value]) => {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = name;
		input.value = value;
		form.appendChild(input);
	});
	document.body.appendChild(form);
	form.submit();
}

const BALANCE_PAYMENTS_KEY = "kiva-balance-payments";

/**
 * Remembers that a transaction pays an order's `balanceDue` (change to a pricier colour / model):
 * `PaymentResult` can't tell, and the result page must not say «سفارشت ثبت شد». Per tab — the bank round trip stays in it.
 */
export function rememberBalancePayment(paymentId: string) {
	try {
		const ids = JSON.parse(sessionStorage.getItem(BALANCE_PAYMENTS_KEY) ?? "[]") as string[];
		sessionStorage.setItem(BALANCE_PAYMENTS_KEY, JSON.stringify([...ids, paymentId].slice(-5)));
	} catch {
		// no storage (private mode, server) — the result page shows the ordinary text
	}
}

export function isBalancePayment(paymentId: string) {
	try {
		return (JSON.parse(sessionStorage.getItem(BALANCE_PAYMENTS_KEY) ?? "[]") as string[]).includes(paymentId);
	} catch {
		return false;
	}
}

/**
 * `422 PAYMENT_GATEWAY_UNAVAILABLE` **with** `meta.orderCode` + `meta.paymentId` (`POST /orders`, retry): the order / transaction
 * was created and the stock is held, only the bank didn't answer — go on with a retry of that `paymentId`, never place it again.
 * Without the meta nothing was created (the gateway is off) — pick another one.
 */
export function createdPaymentOf(error: ResultError | null | undefined): { orderCode: string; paymentId: string } | null {
	if (error?.code !== "PAYMENT_GATEWAY_UNAVAILABLE") return null;
	const { orderCode, paymentId } = error.meta ?? {};
	return typeof orderCode === "string" && typeof paymentId === "string" ? { orderCode, paymentId } : null;
}

/** `Idempotency-Key` value — a UUID where the browser offers one. */
export const newIdempotencyKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : generateID());
