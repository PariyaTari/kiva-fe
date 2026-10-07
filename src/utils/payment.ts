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

/** `Idempotency-Key` value — a UUID where the browser offers one. */
export const newIdempotencyKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : generateID());
