import "./_styles/checkout.css";
import type { Metadata } from "next";
import CheckoutView from "./_components/checkoutView/checkoutView";

export const metadata: Metadata = {
	title: "تکمیل خرید",
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
