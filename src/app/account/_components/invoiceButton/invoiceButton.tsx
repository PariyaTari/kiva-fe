"use client";

import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { OrderCode } from "@/types/order.type";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { isInvoiceNotAvailableError } from "../../_utils/apiError";

/** Saves a blob under the given name (`<a download>`), then lets the object URL go. */
function saveFile(blob: Blob, name: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * «رسید خرید» — downloads the receipt PDF (`GET /me/orders/{code}/invoice`). Since contract 1.21.0 it is a purchase receipt,
 * not an official tax invoice (the design's «فاکتور» label changed with it). `card`: the button of `.ord-acts`;
 * `link`: «دانلود رسید خرید (PDF)» in the payment summary of the details.
 */
export default function InvoiceButton({ code, variant = "card" }: { code: OrderCode; variant?: "card" | "link" }) {
	const download = useMutation({
		mutationFn: () => withMappedError(() => AccountEndpoints.downloadInvoice(code)),
		// the same name as the server's `Content-Disposition`
		onSuccess: (blob) => saveFile(blob, `kiva-${code}.pdf`),
		// the button has no other place for the failure — a toast that can try again (not for an order that was never paid)
		onError: (e) =>
			toast(e.description || "دریافت رسید خرید با خطا مواجه شد", {
				type: isInvoiceNotAvailableError(e) ? "warning" : "error",
				duration: 6000,
				action: isInvoiceNotAvailableError(e) ? undefined : { label: "تلاش دوباره", onClick: () => download.mutate() },
			}),
	});

	if (variant === "link")
		return (
			<button
				type="button"
				className={classNames("btn-link btn", { loading: download.isPending })}
				style={{ fontSize: 12.5, marginTop: 8, gap: 6 }}
				onClick={() => download.mutate()}
			>
				<Icon name="download" /> دانلود رسید خرید (PDF)
			</button>
		);

	return (
		<button type="button" className={classNames("btn btn-white btn-sm", { loading: download.isPending })} onClick={() => download.mutate()}>
			<Icon name="download" /> رسید خرید
		</button>
	);
}
