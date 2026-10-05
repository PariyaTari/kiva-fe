import classNames from "classnames";
import { HTMLAttributes } from "react";

type CardTone = "default" | "soft" | "cream";

type CardProps = HTMLAttributes<HTMLDivElement> & {
	as?: "div" | "section" | "article";
	padded?: boolean;
	/** `default` = white card with border, `soft` = lilac well, `cream` = the cream highlight box. */
	tone?: CardTone;
};

const TONES: Record<CardTone, string> = {
	default: "border border-theme-border bg-surface",
	soft: "bg-brand-subtle",
	cream: "border border-secondary-300 bg-secondary-100 text-secondary-800",
};

export default function Card({
	as: Tag = "div",
	padded = true,
	tone = "default",
	className,
	children,
	...rest
}: CardProps) {
	return (
		<Tag className={classNames("rounded-[18px]", TONES[tone], padded && "p-5 sm:p-6", className)} {...rest}>
			{children}
		</Tag>
	);
}
