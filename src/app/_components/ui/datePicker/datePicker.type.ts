import { ReactNode } from "react";

export type DatePickerProps = {
	label?: ReactNode;

	/** Jalali date string, e.g. "1405/07/13" (English digits), or null when empty. */
	value: string | null;

	onChange: (value: string | null) => void;

	error?: string;

	hint?: string;

	isRequired?: boolean;

	placeholder?: string;

	disabled?: boolean;

	name?: string;

	wrapperClassName?: string;
};
