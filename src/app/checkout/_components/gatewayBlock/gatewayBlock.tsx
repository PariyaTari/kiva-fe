"use client";

import { Icon } from "@/app/_components/icon/icons";
import BankLogo from "@/app/_components/shop/bankLogo/bankLogo";
import { PaymentGatewayCode } from "@/types/order.type";
import { PaymentGateway } from "../../_types/checkout.type";

type GatewayBlockProps = {
	gateways: PaymentGateway[];
	selected: PaymentGatewayCode | null;
	onSelect: (code: PaymentGatewayCode) => void;
};

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
						<BankLogo gateway={g} />
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
