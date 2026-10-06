"use client";

import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { PaymentGatewayCode } from "@/types/order.type";
import { PaymentGateway } from "../../_types/checkout.type";

type GatewayBlockProps = {
	gateways: PaymentGateway[];
	selected: PaymentGatewayCode | null;
	onSelect: (code: PaymentGatewayCode) => void;
};

/** The letter on a light brand colour (Zarinpal's yellow) is drawn in ink, like the design. */
function isLight(hex = "") {
	const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
	if (!m) return false;
	const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
	return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

/** Block ۴ «درگاه پرداخت» — `.pay-opts` cards with the bank's initial on its brand colour. */
export default function GatewayBlock({ gateways, selected, onSelect }: GatewayBlockProps) {
	return (
		<div className="block">
			<h3>
				<span className="n">۴</span> درگاه پرداخت
			</h3>
			<div className="pay-opts">
				{gateways.map((g) => (
					<label key={g.code} className="opt-card" style={g.available === false ? { opacity: 0.55, cursor: "not-allowed" } : undefined}>
						<input type="radio" name="pay" value={g.code} checked={selected === g.code} disabled={g.available === false} onChange={() => onSelect(g.code)} />
						<span className="radio" />
						<span className="bank" style={{ background: g.brandColor ?? "var(--purple)", color: isLight(g.brandColor) ? "#2A1F3D" : undefined }}>
							{g.logoUrl ? <MediaImage src={g.logoUrl} alt={g.name} /> : (g.initial ?? g.name[0])}
						</span>
						<span className="t">{g.name}</span>
					</label>
				))}
			</div>
			<div className="note" style={{ marginTop: 14 }}>
				<Icon name="lock" />
				<span>اطلاعات کارت فقط در صفحه امن درگاه بانکی وارد می‌شه و کیوا به اون دسترسی نداره.</span>
			</div>
		</div>
	);
}
