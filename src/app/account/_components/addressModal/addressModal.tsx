"use client";

import { FormEvent } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddressForm from "@/app/_components/address/addressForm/addressForm";
import { addressErrorsFrom, EMPTY_ADDRESS, fromAddress, toAddressInput } from "@/app/_components/address/_utils/addressForm";
import { useAddressForm } from "@/hooks/useAddressForm";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { Address, AddressInput } from "@/types/address.type";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";

type AddressModalBodyProps = {
	/** `undefined` → «آدرس جدید». */
	address?: Address;
	onSaved: () => void;
};

/** Inside the design's `addrModal` — «آدرس جدید» / «ویرایش آدرس» with the shared address form. */
export default function AddressModalBody({ address, onSaved }: AddressModalBodyProps) {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);
	const { values, errors, formRef, change, validate, showErrors } = useAddressForm(address ? fromAddress(address) : EMPTY_ADDRESS);

	const save = useMutation({
		mutationFn: (input: AddressInput) =>
			withMappedError(() => (address ? AccountEndpoints.updateAddress(address.id, input) : AccountEndpoints.createAddress(input))),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me", "addresses"] });
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			toast("آدرس ذخیره شد", { icon: "pin" });
			onSaved();
		},
		// field answers go back onto the form; anything else is a toast
		onError: (e) => {
			const fieldErrors = addressErrorsFrom(e.errorDetails);
			if (e.code === "CITY_NOT_IN_PROVINCE") fieldErrors.cityId = e.description;
			if (Object.keys(fieldErrors).length) showErrors(fieldErrors);
			else toast(e.description, { type: "error" });
		},
	});

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const valid = validate();
		if (valid) save.mutate(toAddressInput(valid));
	};

	return (
		<>
			<h3>{address ? "ویرایش آدرس" : "آدرس جدید"}</h3>
			<p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
				استان، شهر، آدرس، کد پستی، نام و موبایل گیرنده
			</p>
			<form id="af" noValidate onSubmit={submit}>
				<AddressForm
					ref={formRef}
					values={values}
					errors={errors}
					onChange={change}
					self={{ name: user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "), phone: user?.phone }}
				/>
				<button type="submit" className={classNames("btn btn-primary btn-block", { loading: save.isPending })} style={{ marginTop: 18 }}>
					ذخیره آدرس
				</button>
			</form>
		</>
	);
}
