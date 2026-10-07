import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";

type MiniStepsProps = {
	steps: { label: string; at?: string }[];
	/** Index of the step in progress; the last step counts as done once reached. */
	current: number;
	/** Icon of each step that isn't done yet (`clock` when missing). */
	icons: string[];
};

/** `.stepper.st-mini` — the small 3/4-step strip of a refund or a return (design `A.miniSteps`). */
export default function MiniSteps({ steps, current, icons }: MiniStepsProps) {
	const last = steps.length - 1;
	return (
		<div className={classNames("stepper st-mini", { s3: steps.length === 3 })}>
			{steps.map((s, i) => {
				const done = i < current || (i === current && current === last);
				return (
					<div key={s.label} className={classNames("step", { done, cur: !done && i === current })}>
						<span className="dot">
							<Icon name={done ? "check" : (icons[i] ?? "clock")} />
						</span>
						<span>
							{s.label}
							<small>{s.at || "—"}</small>
						</span>
					</div>
				);
			})}
		</div>
	);
}
