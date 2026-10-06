import { redirect } from "next/navigation";

/** `/account` opens on «سفارش‌های من», like the design's default panel. */
export default function AccountPage() {
	redirect("/account/orders");
}
