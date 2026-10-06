import { Address, AddressInput } from "@/types/address.type";
import { ErrorDetail } from "@/types/result";

/** What the address form edits — select values as strings, digits kept in ASCII (shown in Persian). */
export type AddressFormValues = {
	provinceId: string;
	cityId: string;
	addressLine: string;
	postalCode: string;
	recipientName: string;
	recipientPhone: string;
	isSelfRecipient: boolean;
};

export type AddressField = Exclude<keyof AddressFormValues, "isSelfRecipient">;

export type AddressFormErrors = Partial<Record<AddressField, string>>;

/** Order of the fields on screen — the first invalid one gets the focus (design `bindAddrForm`). */
export const ADDRESS_FIELDS: AddressField[] = ["provinceId", "cityId", "addressLine", "postalCode", "recipientName", "recipientPhone"];

export const EMPTY_ADDRESS: AddressFormValues = {
	provinceId: "",
	cityId: "",
	addressLine: "",
	postalCode: "",
	recipientName: "",
	recipientPhone: "",
	isSelfRecipient: false,
};

const PHONE = /^09\d{9}$/;

/** The design's checks, field by field (`AddressInput` limits of the API). */
export function validateAddress(v: AddressFormValues): AddressFormErrors {
	const errors: AddressFormErrors = {};
	if (!v.provinceId) errors.provinceId = "استان رو انتخاب کن";
	if (!v.cityId) errors.cityId = "شهر رو انتخاب کن";
	if (v.addressLine.trim().length < 10) errors.addressLine = "آدرس کامل رو بنویس";
	if (!/^\d{10}$/.test(v.postalCode)) errors.postalCode = "کد پستی باید ۱۰ رقم باشه";
	if (v.recipientName.trim().length < 3) errors.recipientName = "نام گیرنده رو وارد کن";
	if (!PHONE.test(v.recipientPhone)) errors.recipientPhone = "موبایل معتبر وارد کن";
	return errors;
}

export const toAddressInput = (v: AddressFormValues, setAsDefault?: boolean): AddressInput => ({
	provinceId: Number(v.provinceId),
	cityId: Number(v.cityId),
	addressLine: v.addressLine.trim(),
	postalCode: v.postalCode,
	recipientName: v.recipientName.trim(),
	recipientPhone: v.recipientPhone,
	isSelfRecipient: v.isSelfRecipient,
	...(setAsDefault !== undefined && { setAsDefault }),
});

export const fromAddress = (a: Address): AddressFormValues => ({
	provinceId: String(a.provinceId),
	cityId: String(a.cityId),
	addressLine: a.addressLine,
	postalCode: a.postalCode,
	recipientName: a.recipientName,
	recipientPhone: a.recipientPhone,
	isSelfRecipient: !!a.isSelfRecipient,
});

/**
 * Field errors of a server `VALIDATION_ERROR` (`newAddress.postalCode`, `postalCode`, …) mapped back onto the form;
 * empty when none of them belongs to it.
 */
export function addressErrorsFrom(details: ErrorDetail[] | null, prefix = ""): AddressFormErrors {
	const errors: AddressFormErrors = {};
	details?.forEach((d) => {
		const field = d.field?.startsWith(prefix) ? d.field.slice(prefix.length) : null;
		if (field && (ADDRESS_FIELDS as string[]).includes(field)) errors[field as AddressField] = d.message;
	});
	return errors;
}

/** «استان، شهر، آدرس» — the API's `fullText`, built locally when it is missing. */
export const addressText = (a: Pick<Address, "provinceName" | "cityName" | "addressLine" | "fullText">) =>
	a.fullText || `${a.provinceName}، ${a.cityName}، ${a.addressLine}`;
