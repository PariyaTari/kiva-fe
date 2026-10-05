import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/** Mirrors the design-system buttons: `.btn-primary`, `.btn-dark`, `.btn-soft`, `.btn-outline`, `.btn-white`. */
export type ButtonVariant =
	| "primary"
	| "dark"
	| "soft"
	| "outline"
	| "white"
	| "ghost"
	| "danger";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	fullWidth?: boolean;
	iconStart?: ReactNode;
	iconEnd?: ReactNode;
	children?: ReactNode;
	className?: string;
};

type ButtonAsButton = ButtonBaseProps &
	Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
		href?: undefined;
	};

type ButtonAsLink = ButtonBaseProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
		href: string;
	};

export type ButtonProps = ButtonAsButton | ButtonAsLink;
