import { ReactNode, SelectHTMLAttributes } from "react";

export type SelectOption = {
	value: string;
	label: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
	label?: string;
	error?: string;
	hint?: string;
	isRequired?: boolean;
	iconStart?: ReactNode;
	placeholder?: string;
	options: SelectOption[];
};
