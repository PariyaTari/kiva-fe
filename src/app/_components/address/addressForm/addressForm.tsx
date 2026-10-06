"use client";

import { forwardRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Checkbox from "@/app/_components/ui/checkbox/checkbox";
import Input from "@/app/_components/ui/input/input";
import Select from "@/app/_components/ui/select/select";
import Textarea from "@/app/_components/ui/textarea/textarea";
import { toErrorView } from "@/utils/apiError";
import { digitsOnly, toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { GeoEndpoints } from "../_api/geoEndpoints";
import { ERROR_BEHAVIOUR } from "../_utils/apiError";
import { AddressFormErrors, AddressFormValues } from "../_utils/addressForm";

type AddressFormProps = {
	values: AddressFormValues;
	errors: AddressFormErrors;
	onChange: (patch: Partial<AddressFormValues>) => void;
	/** What «گیرنده خودم هستم» fills in — the signed-in shopper. */
	self?: { name?: string | null; phone?: string | null };
};

/** The design's `K.addrForm` (`.form-grid.addr-form`) — checkout «آدرس جدید» and the account address modal. */
const AddressForm = forwardRef<HTMLDivElement, AddressFormProps>(function AddressForm({ values, errors, onChange, self }, ref) {
	const provinces = useQuery({
		queryKey: ["geo", "provinces"],
		queryFn: () => withMappedError(() => GeoEndpoints.getProvinces()),
		meta: { showNotificationOnRefetch: true },
	});

	const provinceOptions = useMemo(() => (provinces.data ?? []).map((p) => ({ value: String(p.id), label: p.name })), [provinces.data]);
	const cities = useMemo(() => provinces.data?.find((p) => String(p.id) === values.provinceId)?.cities ?? [], [provinces.data, values.provinceId]);

	const pickProvince = (provinceId: string) => {
		const list = provinces.data?.find((p) => String(p.id) === provinceId)?.cities ?? [];
		// a province with a single city picks it right away (design)
		onChange({ provinceId, cityId: list.length === 1 ? String(list[0].id) : "" });
	};

	const toggleSelf = (checked: boolean) =>
		onChange(
			checked
				? { isSelfRecipient: true, recipientName: self?.name || values.recipientName, recipientPhone: self?.phone ?? values.recipientPhone }
				: { isSelfRecipient: false },
		);

	const provincesError = toErrorView(ERROR_BEHAVIOUR, provinces.error, "دریافت لیست استان‌ها با خطا مواجه شد.");

	return (
		<div className="form-grid addr-form" ref={ref}>
			{!!provincesError && (
				<div className="full">
					<ErrorComponent
						retryable={provincesError.retryable}
						ticketAble={provincesError.ticketAble}
						errorText={provincesError.errorText}
						executeFunction={() => provinces.refetch()}
						height={56}
						loading={provinces.isFetching}
					/>
				</div>
			)}
			<Select
				name="provinceId"
				label="استان"
				placeholder={provinces.isLoading ? "در حال دریافت…" : "انتخاب استان"}
				options={provinceOptions}
				value={values.provinceId}
				disabled={provinces.isLoading}
				error={errors.provinceId}
				onChange={(e) => pickProvince(e.target.value)}
			/>
			<Select
				name="cityId"
				label="شهر"
				placeholder={values.provinceId ? "انتخاب شهر" : "اول استان رو انتخاب کن"}
				options={cities.map((c) => ({ value: String(c.id), label: c.name }))}
				value={values.cityId}
				error={errors.cityId}
				onChange={(e) => onChange({ cityId: e.target.value })}
			/>
			<Textarea
				name="addressLine"
				label="آدرس پستی"
				wrapperClassName="full"
				style={{ minHeight: 90 }}
				placeholder="خیابان، کوچه، پلاک، واحد"
				maxLength={300}
				value={values.addressLine}
				error={errors.addressLine}
				onChange={(e) => onChange({ addressLine: e.target.value })}
			/>
			<Input
				name="postalCode"
				label="کد پستی"
				direction="ltr"
				inputMode="numeric"
				maxLength={10}
				placeholder="۱۰ رقم، بدون خط تیره"
				value={toPersianDigits(values.postalCode)}
				error={errors.postalCode}
				onChange={(e) => onChange({ postalCode: digitsOnly(e.target.value, 10).en })}
			/>
			<div className="field" style={{ justifyContent: "flex-end" }}>
				<Checkbox
					name="self"
					label="گیرنده خودم هستم"
					labelStyle={{ height: 50 }}
					checked={values.isSelfRecipient}
					onChange={(e) => toggleSelf(e.target.checked)}
				/>
			</div>
			<Input
				name="recipientName"
				label="نام و نام خانوادگی گیرنده"
				autoComplete="name"
				maxLength={80}
				value={values.recipientName}
				error={errors.recipientName}
				onChange={(e) => onChange({ recipientName: e.target.value })}
			/>
			<Input
				name="recipientPhone"
				label="موبایل گیرنده"
				direction="ltr"
				inputMode="numeric"
				maxLength={11}
				placeholder="۰۹۱۲۳۴۵۶۷۸۹"
				value={toPersianDigits(values.recipientPhone)}
				error={errors.recipientPhone}
				onChange={(e) => onChange({ recipientPhone: digitsOnly(e.target.value, 11).en })}
			/>
		</div>
	);
});

export default AddressForm;
