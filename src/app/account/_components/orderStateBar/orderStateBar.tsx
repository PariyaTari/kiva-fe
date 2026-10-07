import { ReactNode } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";

type OrderStateBarProps = {
	tone?: "warn" | "danger" | "success" | "cream";
	icon: string;
	title: string;
	text: ReactNode;
	/** Amount / buttons at the end. */
	children?: ReactNode;
};

/** `.st-bar` — the main action of an order state above the card (unpaid, failed, expired, cancelled). */
export default function OrderStateBar({ tone, icon, title, text, children }: OrderStateBarProps) {
	return (
		<div className={classNames("st-bar", tone)}>
			<Icon name={icon} />
			<span className="tx">
				<b>{title}</b>
				<small>{text}</small>
			</span>
			{children && <span className="go">{children}</span>}
		</div>
	);
}
