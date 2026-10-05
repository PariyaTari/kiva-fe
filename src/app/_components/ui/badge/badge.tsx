import classNames from "classnames";
import { BadgeProps, BadgeSize, BadgeTone } from "./badge.type";

const TONES: Record<BadgeTone, { wrap: string; dot: string }> = {
	default: { wrap: "border-primary-400 bg-primary-100 text-primary-800", dot: "bg-primary-600" },
	sale: { wrap: "border-primary-600 bg-primary-600 text-white", dot: "bg-white" },
	warn: { wrap: "border-warning-100 bg-warning-50 text-warning-600", dot: "bg-warning-500" },
	success: { wrap: "border-success-100 bg-success-50 text-success-600", dot: "bg-success-500" },
	cream: { wrap: "border-secondary-300 bg-secondary-100 text-secondary-800", dot: "bg-secondary-400" },
	dark: { wrap: "border-primary-900 bg-primary-900 text-white", dot: "bg-primary-300" },
	glass: {
		wrap: "border-white/95 bg-white/80 text-primary-900 backdrop-blur-md",
		dot: "bg-primary-600",
	},
	danger: { wrap: "border-danger-100 bg-danger-50 text-danger-600", dot: "bg-danger-500" },
};

const SIZES: Record<BadgeSize, string> = {
	md: "h-[26px] px-2.5 text-[11.5px]",
	lg: "h-8 px-3.5 text-[12.5px]",
};

export default function Badge({
	tone = "default",
	size = "md",
	dot = false,
	iconStart,
	className,
	children,
	...rest
}: BadgeProps) {
	const t = TONES[tone];
	return (
		<span
			className={classNames(
				"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border font-bold leading-none",
				t.wrap,
				SIZES[size],
				className,
			)}
			{...rest}
		>
			{dot && <span className={classNames("h-1.5 w-1.5 rounded-full", t.dot)} />}
			{iconStart}
			{children}
		</span>
	);
}
