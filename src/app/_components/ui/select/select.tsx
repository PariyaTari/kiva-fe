"use client";

import { forwardRef, useId } from "react";
import classNames from "classnames";
import { IconChevronDown } from "@/app/_components/icon/icons";
import { SelectProps } from "./select.type";

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
	{ label, error, hint, isRequired, iconStart, placeholder, options, className, id, ...rest },
	ref,
) {
	const autoId = useId();
	const selectId = id ?? autoId;

	return (
		<div className="flex min-w-0 flex-col gap-[7px]">
			{label && (
				<label htmlFor={selectId} className="text-[13px] font-bold text-theme-text">
					{label}
					{isRequired && <span className="mr-1 text-danger-600">*</span>}
				</label>
			)}
			<div className="relative">
				{iconStart && (
					<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-theme-text-subtle">
						{iconStart}
					</span>
				)}
				<select
					id={selectId}
					ref={ref}
					className={classNames(
						"h-[50px] w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] bg-surface pl-10 text-[14.5px] text-theme-text outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_4px_rgba(91,62,140,0.12)] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
						iconStart ? "pr-11" : "pr-4",
						error
							? "border-danger-600 focus:border-danger-600"
							: "border-theme-border-strong hover:border-theme-text-subtle focus:border-brand",
						className,
					)}
					aria-invalid={!!error}
					{...rest}
				>
					{placeholder && <option value="">{placeholder}</option>}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				<span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text">
					<IconChevronDown width={16} height={16} strokeWidth="2" />
				</span>
			</div>
			{error ? (
				<span className="text-xs font-medium text-danger-600">{error}</span>
			) : hint ? (
				<span className="text-xs text-theme-text-subtle">{hint}</span>
			) : null}
		</div>
	);
});

export default Select;
