import { generateID } from "@/utils/generateId";
import { PaymentRedirect } from "@/types/order.type";

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

/** `Idempotency-Key` value — a UUID where the browser offers one. */
export const newIdempotencyKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : generateID());
