import "@/app/_styles/notFound.css";
import type { Metadata } from "next";
import { NO_INDEX } from "@/utils/seo";
import UnsubscribeView from "../_components/unsubscribeView/unsubscribeView";

export const metadata: Metadata = {
	title: "لغو عضویت خبرنامه",
	robots: NO_INDEX,
};

type UnsubscribePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** `/newsletter/unsubscribe?token=nl_…` — the link of the newsletter's welcome e-mail (contract 1.21.0). */
export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
	const { token } = await searchParams;
	return (
		<div className="pg-404">
			<UnsubscribeView token={typeof token === "string" ? token : ""} />
		</div>
	);
}
