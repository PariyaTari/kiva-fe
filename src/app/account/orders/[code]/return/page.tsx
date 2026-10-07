import type { Metadata } from "next";
import ReturnView from "../../../_components/returnView/returnView";

export const metadata: Metadata = {
	title: "درخواست مرجوعی",
};

type ReturnPageProps = {
	params: Promise<{ code: string }>;
};

/** `/account/orders/{code}/return` — design `kiva-order-actions/order-return.html` (checkout-like, without the account menu). */
export default async function ReturnPage({ params }: ReturnPageProps) {
	const { code } = await params;
	return <ReturnView code={decodeURIComponent(code)} />;
}
