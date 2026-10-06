import "./_styles/faq.css";
import type { Metadata } from "next";
import FaqView from "./_components/faqView/faqView";

export const metadata: Metadata = {
	title: "سوالات متداول",
};

/** FAQ — design `faq.html`; `/faq#reserve` (shipping, return…) opens that group. */
export default function FaqPage() {
	return (
		<div className="pg-faq">
			<main>
				<FaqView />
			</main>
		</div>
	);
}
