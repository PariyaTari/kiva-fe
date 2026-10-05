"use client";

import { useId, useMemo } from "react";
import RMDPicker, { Value } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import transition from "react-element-popper/animations/transition";
import opacity from "react-element-popper/animations/opacity";
import moment from "jalali-moment";
import classNames from "classnames";
import { convertPersianToEnglishString } from "@/utils/digits";
import { IconCalendar } from "@/app/_components/icon/icons";
import { DatePickerProps } from "./datePicker.type";

export default function DatePicker({
	label,
	value,
	onChange,
	error,
	hint,
	isRequired = false,
	placeholder = "انتخاب تاریخ",
	disabled = false,
	name,
	wrapperClassName,
}: DatePickerProps) {
	const reactId = useId();
	const inputId = name ?? reactId;
	const hasError = Boolean(error);

	// Fully controlled by the parent: derive the picker's Date from the incoming Jalali string.
	const date = useMemo<Value | undefined>(() => {
		if (!value) return undefined;
		const gregorian = moment(value, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
		return new Date(gregorian);
	}, [value]);

	const handleChange = (next: Value) => {
		onChange(next?.toString() ? convertPersianToEnglishString(next.toString()) : null);
	};

	return (
		<div className={classNames("kiva-datepicker flex min-w-0 flex-col gap-[7px]", wrapperClassName)}>
			{label && (
				<label htmlFor={inputId} className="text-[13px] font-bold text-theme-text">
					{label}
					{isRequired && <span className="mr-1 text-danger-600">*</span>}
				</label>
			)}

			<div className="relative">
				<span className="pointer-events-none absolute inset-y-0 right-0 z-10 grid w-12 place-items-center text-theme-text-subtle">
					<IconCalendar width={18} height={18} />
				</span>

				<RMDPicker
					id={inputId}
					value={date}
					onChange={handleChange}
					disabled={disabled}
					calendar={persian}
					locale={persian_fa}
					calendarPosition="bottom-right"
					highlightToday={false}
					placeholder={placeholder}
					containerClassName="w-full"
					animations={[
						opacity(),
						transition({ from: 40, transition: "all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)" }),
					]}
					inputClass={classNames(
						"h-[50px] w-full rounded-[10px] border-[1.5px] bg-surface pr-12 pl-4 text-[14.5px] text-theme-text placeholder:text-theme-text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus:shadow-[0_0_0_4px_rgba(91,62,140,0.12)] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
						hasError
							? "border-danger-600 focus:border-danger-600"
							: "border-theme-border-strong hover:border-theme-text-subtle focus:border-brand",
					)}
				/>
			</div>

			{error ? (
				<span className="text-xs font-medium text-danger-600">{error}</span>
			) : hint ? (
				<span className="text-xs text-theme-text-subtle">{hint}</span>
			) : null}
		</div>
	);
}
