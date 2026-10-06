"use client";

import { Ref } from "react";
import Link from "next/link";
import AddressForm from "@/app/_components/address/addressForm/addressForm";
import { AddressFormErrors, AddressFormValues, addressText } from "@/app/_components/address/_utils/addressForm";
import { Icon } from "@/app/_components/icon/icons";
import Checkbox from "@/app/_components/ui/checkbox/checkbox";
import { Address } from "@/types/address.type";
import { toPersianDigits } from "@/utils/digits";

type AddressBlockProps = {
	addresses: Address[];
	selectedId: number | null;
	onSelect: (id: number) => void;
	/** «آدرس جدید» is open (always, when there is no saved address). */
	newOpen: boolean;
	onOpenNew: () => void;
	/** State of the new-address form (`useAddressForm`). */
	formRef: Ref<HTMLDivElement>;
	values: AddressFormValues;
	errors: AddressFormErrors;
	onChange: (patch: Partial<AddressFormValues>) => void;
	saveAddress: boolean;
	onSaveAddress: (save: boolean) => void;
	self: { name?: string | null; phone?: string | null };
};

/** Block ۱ «آدرس تحویل» — saved addresses as `.opt-card` radios, or the new-address form. */
export default function AddressBlock({
	addresses,
	selectedId,
	onSelect,
	newOpen,
	onOpenNew,
	formRef,
	values,
	errors,
	onChange,
	saveAddress,
	onSaveAddress,
	self,
}: AddressBlockProps) {
	return (
		<div className="block">
			<h3>
				<span className="n">۱</span> آدرس تحویل
				{!!addresses.length && (
					<Link className="btn-link act" href="/account/addresses" style={{ fontSize: 13 }}>
						مدیریت آدرس‌ها
					</Link>
				)}
			</h3>
			{!!addresses.length && (
				<div className="addr-list">
					{addresses.map((a) => (
						<label key={a.id} className="opt-card">
							<input type="radio" name="addr" value={a.id} checked={!newOpen && a.id === selectedId} onChange={() => onSelect(a.id)} />
							<span className="radio" />
							<span>
								<span className="t">
									{a.recipientName}{" "}
									<span className="muted" style={{ fontWeight: 500, fontSize: 13 }}>
										{toPersianDigits(a.recipientPhone)}
									</span>
								</span>
								<span className="d" style={{ display: "block" }}>
									{addressText(a)} — کد پستی {toPersianDigits(a.postalCode)}
								</span>
							</span>
						</label>
					))}
				</div>
			)}
			{newOpen ? (
				<div className="new-addr" id="newAddr">
					{!!addresses.length && <b style={{ display: "block", marginBottom: 14 }}>آدرس جدید</b>}
					<AddressForm ref={formRef} values={values} errors={errors} onChange={onChange} self={self} />
					<Checkbox
						id="saveAddr"
						label="ذخیره این آدرس در حساب کاربری"
						labelStyle={{ marginTop: 14 }}
						checked={saveAddress}
						onChange={(e) => onSaveAddress(e.target.checked)}
					/>
				</div>
			) : (
				<button type="button" className="add-addr" id="addAddr" style={{ marginTop: 12 }} onClick={onOpenNew}>
					<Icon name="plus" /> افزودن آدرس جدید
				</button>
			)}
		</div>
	);
}
