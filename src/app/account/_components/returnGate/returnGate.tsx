import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";

type ReturnGateProps = {
	/** The 7-day window passed — offer support instead. */
	expired: boolean;
	text: string;
};

/** The closed return page: «مهلت مرجوعی این سفارش تموم شده» / «این سفارش قابل مرجوعی نیست». */
export default function ReturnGate({ expired, text }: ReturnGateProps) {
	return (
		<div className="container">
			<div className="empty" style={{ padding: "70px 0 40px" }}>
				<div className="art">
					<BagArt type="tote" color="lilac" variant={2} />
				</div>
				<h4>{expired ? "مهلت مرجوعی این سفارش تموم شده" : "این سفارش قابل مرجوعی نیست"}</h4>
				<p style={{ maxWidth: 460, margin: "0 auto" }}>{text}</p>
				<div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
					{expired && (
						<Link className="btn btn-primary" href="/contact?topic=return">
							<Icon name="headset" /> تماس با پشتیبانی
						</Link>
					)}
					<Link className={`btn ${expired ? "btn-outline" : "btn-primary"}`} href="/account/orders">
						سفارش‌های من
					</Link>
				</div>
			</div>
		</div>
	);
}
