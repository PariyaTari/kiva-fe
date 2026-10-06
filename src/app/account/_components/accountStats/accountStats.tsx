import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { IconName } from "@/app/_components/icon/icon.types";
import { toPersianDigits } from "@/utils/digits";
import { AccountDashboard } from "../../_types/account.type";

type StatKey = keyof NonNullable<AccountDashboard["stats"]>;

const CARDS: { key: StatKey; icon: IconName; label: string }[] = [
	{ key: "ordersTotal", icon: "box", label: "کل سفارش‌ها" },
	{ key: "ordersActive", icon: "truck", label: "سفارش جاری" },
	{ key: "mediaReceived", icon: "camera", label: "عکس و ویدیوی دریافتی" },
	{ key: "wishlistCount", icon: "heart", label: "علاقه‌مندی" },
];

/** `#stats` — the four cards overlapping the hero; «—» until the dashboard answers. */
export default function AccountStats({ stats }: { stats?: AccountDashboard["stats"] }) {
	return (
		<div className="stats" id="stats">
			{CARDS.map((card, i) => (
				<Reveal key={card.key} className="stat" delay={i ? i * 0.06 : undefined}>
					<span className="si">
						<Icon name={card.icon} />
					</span>
					<span>
						<b>{stats ? toPersianDigits(stats[card.key]) : "—"}</b>
						<span>{card.label}</span>
					</span>
				</Reveal>
			))}
		</div>
	);
}
