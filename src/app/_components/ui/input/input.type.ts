import { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
	label?: string;
	error?: string;
	hint?: string;
	isRequired?: boolean;
	iconStart?: ReactNode;
	/** Trailing icon (rendered on the far edge). Becomes a button when `onIconEndClick` is set. */
	iconEnd?: ReactNode;
	onIconEndClick?: () => void;
	iconEndLabel?: string;
	/** Force text direction — use `"ltr"` for phone numbers, postal codes, emails and codes. */
	direction?: "ltr" | "rtl";
};
