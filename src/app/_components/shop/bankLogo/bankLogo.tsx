import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { PaymentGateway } from "@/types/siteConfig.type";

/** The letter on a light brand colour (Zarinpal's yellow) is drawn in ink, like the design. */
function isLight(hex = "") {
	const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
	if (!m) return false;
	const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
	return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

/** `.bank` — the gateway's logo, or its initial on the brand colour. */
export default function BankLogo({ gateway }: { gateway: PaymentGateway }) {
	return (
		<span className="bank" style={{ background: gateway.brandColor ?? "var(--purple)", color: isLight(gateway.brandColor) ? "#2A1F3D" : undefined }}>
			{gateway.logoUrl ? <MediaImage src={gateway.logoUrl} alt={gateway.name} /> : (gateway.initial ?? gateway.name[0])}
		</span>
	);
}
