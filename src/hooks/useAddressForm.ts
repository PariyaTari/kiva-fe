import { useCallback, useRef, useState } from "react";
import { ADDRESS_FIELDS, AddressFormErrors, AddressFormValues, EMPTY_ADDRESS, validateAddress } from "@/app/_components/address/_utils/addressForm";

/**
 * State of an `AddressForm` (state only — no requests). Like the design's `bindAddrForm`: a field's error
 * clears as soon as it is edited, and `validate()` marks every invalid field and focuses the first one.
 */
export function useAddressForm(initial: AddressFormValues = EMPTY_ADDRESS) {
	const [values, setValues] = useState<AddressFormValues>(initial);
	const [errors, setErrors] = useState<AddressFormErrors>({});
	/** Root of the rendered form — `validate()` looks the first invalid field up by its `name`. */
	const formRef = useRef<HTMLDivElement>(null);

	const change = useCallback((patch: Partial<AddressFormValues>) => {
		setValues((v) => ({ ...v, ...patch }));
		setErrors((e) => {
			const next = { ...e };
			Object.keys(patch).forEach((k) => delete next[k as keyof AddressFormErrors]);
			return next;
		});
	}, []);

	const focusFirst = useCallback((errs: AddressFormErrors) => {
		const first = ADDRESS_FIELDS.find((f) => errs[f]);
		if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
	}, []);

	/** The values when valid, otherwise `null` with the errors shown. */
	const validate = (): AddressFormValues | null => {
		const errs = validateAddress(values);
		setErrors(errs);
		focusFirst(errs);
		return Object.keys(errs).length ? null : values;
	};

	/** Errors that came back from the server (`addressErrorsFrom`). */
	const showErrors = (errs: AddressFormErrors) => {
		setErrors(errs);
		focusFirst(errs);
	};

	const reset = useCallback((next: AddressFormValues = EMPTY_ADDRESS) => {
		setValues(next);
		setErrors({});
	}, []);

	return { values, errors, formRef, change, validate, showErrors, reset };
}
