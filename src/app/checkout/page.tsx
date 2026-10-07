import "./_styles/checkout.css";
import type { Metadata } from "next";
import { NO_INDEX } from "@/utils/seo";
import CheckoutView from "./_components/checkoutView/checkoutView";

export const metadata: Metadata = {
	title: "تکمیل خرید",
	robots: NO_INDEX,
};

/** Checkout — design `checkout.html`. */
export default function CheckoutPage() {
	return (
		<div className="pg-checkout">
			<main>
				<CheckoutView />
			</main>
		</div>
	);
}
