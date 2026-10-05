"use client";

import { forwardRef, useId } from "react";
import classNames from "classnames";
import { InputProps } from "./input.type";

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{
		label,
		error,
		hint,
		isRequired,
		iconStart,
		iconEnd,
		onIconEndClick,
		iconEndLabel,
		direction,
		className,
		id,
		...rest
	},
	ref,
) {
	const autoId = useId();
	const inputId = id ?? autoId;

	return (
		<div className="flex min-w-0 flex-col gap-[7px]">
			{label && (
				<label htmlFor={inputId} className="text-[13px] font-bold text-theme-text">
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
				<input
					id={inputId}
					ref={ref}
					dir={direction}
					className={classNames(
						"h-[50px] w-full rounded-[10px] border-[1.5px] bg-surface px-4 text-[14.5px] text-theme-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-theme-text-subtle focus:shadow-[0_0_0_4px_rgba(91,62,140,0.12)] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
						iconStart ? "pr-11" : "",
						iconEnd ? "pl-11" : "",
						direction === "ltr" ? "text-left" : "",
						error
							? "border-danger-600 focus:border-danger-600"
							: "border-theme-border-strong hover:border-theme-text-subtle focus:border-brand",
						className,
					)}
					aria-invalid={!!error}
					{...rest}
				/>
				{iconEnd &&
					(onIconEndClick ? (
						<button
							type="button"
							onClick={onIconEndClick}
							aria-label={iconEndLabel}
							title={iconEndLabel}
							className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-theme-text-subtle transition-colors hover:text-brand"
						>
							{iconEnd}
						</button>
					) : (
						<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-subtle">
							{iconEnd}
						</span>
					))}
			</div>
			{error ? (
				<span className="text-xs font-medium text-danger-600">{error}</span>
			) : hint ? (
				<span className="text-xs text-theme-text-subtle">{hint}</span>
			) : null}
		</div>
	);
});

export default Input;
