"use client";

import classNames from "classnames";
import Link from "next/link";
import { ButtonProps, ButtonSize, ButtonVariant } from "./button.type";

const VARIANTS: Record<ButtonVariant, string> = {
	primary:
		"border-brand bg-brand text-brand-fg hover:-translate-y-px hover:border-brand-hover hover:bg-brand-hover hover:shadow-[0_12px_26px_-12px_rgba(91,62,140,0.7)]",
	dark: "border-theme-heading bg-theme-heading text-background hover:-translate-y-px hover:opacity-90",
	soft:
		"border-primary-400 bg-primary-100 text-primary-800 hover:border-brand hover:bg-brand hover:text-brand-fg dark:border-theme-border-strong dark:bg-brand-subtle dark:text-brand dark:hover:text-brand-fg",
	outline:
		"border-theme-text-subtle bg-transparent text-theme-text hover:border-theme-heading hover:bg-theme-heading hover:text-background",
	white:
		"border-theme-border bg-surface text-theme-text shadow-kiva-sm hover:border-theme-heading hover:shadow-kiva",
	ghost: "border-transparent bg-transparent text-theme-text-muted hover:bg-surface-muted hover:text-theme-text",
	danger: "border-danger-600 bg-danger-600 text-white hover:border-danger-700 hover:bg-danger-700",
};

const SIZES: Record<ButtonSize, string> = {
	sm: "h-[38px] gap-1.5 px-4 text-[13px] rounded-[10px]",
	md: "h-12 gap-2 px-6 text-[14.5px] rounded-xl",
	lg: "h-[54px] gap-2.5 px-[30px] text-[15.5px] rounded-[14px]",
};

const Spinner = () => (
	<svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
		<path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
	</svg>
);

export default function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	fullWidth = false,
	iconStart,
	iconEnd,
	className,
	children,
	...rest
}: ButtonProps) {
	const classes = classNames(
		"group inline-flex select-none items-center justify-center whitespace-nowrap border-[1.5px] font-semibold transition-all duration-300 ease-kiva active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
		VARIANTS[variant],
		SIZES[size],
		{ "w-full": fullWidth },
		className,
	);

	const content = (
		<>
			{isLoading ? <Spinner /> : iconStart}
			{children}
			{iconEnd}
		</>
	);

	if (rest.href !== undefined) {
		const { href, ...linkRest } = rest;
		return (
			<Link href={href} className={classes} {...linkRest}>
				{content}
			</Link>
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip `href` so it never reaches <button>
	const { href: _href, disabled, ...buttonRest } = rest;
	return (
		<button className={classes} disabled={disabled || isLoading} {...buttonRest}>
			{content}
		</button>
	);
}
