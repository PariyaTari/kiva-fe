import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { OrderProgress } from "@/types/order.type";
import { formatDate } from "@/utils/format";

const STEP_ICON = { PLACED: "check", PHOTO_SENT: "camera", SHIPPED: "truck", DELIVERED: "home" } as const;

/** `.stepper` — ثبت شد → عکس ارسال شد → تحویل پست شد → تحویل شد, each with its date (the public tracking result shows none). */
export default function OrderStepper({ progress, dates = true }: { progress: OrderProgress; dates?: boolean }) {
	return (
		<div className="stepper" aria-label="وضعیت سفارش">
			{progress.steps.map((step) => (
				<div key={step.key} className={classNames("step", { done: step.state === "DONE", cur: step.state === "CURRENT" })}>
					<span className="dot">
						<Icon name={step.state === "DONE" ? "check" : (step.icon ?? STEP_ICON[step.key])} />
					</span>
					<span>
						{step.label}
						{dates && <small>{step.at ? formatDate(step.at, { day: "numeric", month: "long" }) : "—"}</small>}
					</span>
				</div>
			))}
		</div>
	);
}
