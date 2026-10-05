import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { HomeFeature } from "../../_types/home.type";

/** `.feats` — the four promises overlapping the hero's bottom edge. */
export default function FeatureStrip({ features }: { features: HomeFeature[] }) {
	return (
		<div className="container">
			<div className="feats">
				{features.map((f, i) => (
					<Reveal key={f.title} className="feat" delay={i * 0.08}>
						<span className="fi">
							<Icon name={f.icon} />
						</span>
						<div>
							<b>{f.title}</b>
							<span>{f.subtitle}</span>
						</div>
					</Reveal>
				))}
			</div>
		</div>
	);
}
