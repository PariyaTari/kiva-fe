import "../_styles/checkout.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import PaymentResultView from "../_components/paymentResultView/paymentResultView";

export const metadata: Metadata = {
	title: "نتیجه پرداخت",
};

/** Back from the bank — `/checkout/result?paymentId=…` (the backend's payment callback redirects here). */
export default function PaymentResultPage() {
	return (
		<div className="pg-checkout">
			<main>
				<Suspense>
					<PaymentResultView />
				</Suspense>
			</main>
		</div>
	);
}
