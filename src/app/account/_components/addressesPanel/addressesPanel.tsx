"use client";

import { useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressText } from "@/app/_components/address/_utils/addressForm";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import Modal from "@/app/_components/ui/modal/modal";
import { toast } from "@/store/notification.store";
import { Address } from "@/types/address.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import AddressModalBody from "../addressModal/addressModal";

/** `#p-addresses` «آدرس‌های من» — default first, edit / make default / delete, and «افزودن آدرس جدید». */
export default function AddressesPanel() {
	const queryClient = useQueryClient();
	// `seq` re-keys the form so every opening starts from the address it was opened for
	const [modal, setModal] = useState<{ open: boolean; address?: Address; seq: number }>({ open: false, seq: 0 });

	const addresses = useQuery({
		queryKey: ["me", "addresses"],
		queryFn: () => withMappedError(() => AccountEndpoints.getAddresses()),
		meta: { showNotificationOnRefetch: true },
	});

	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["me", "addresses"] });
		queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
	};

	const makeDefault = useMutation({
		mutationFn: (id: number) => withMappedError(() => AccountEndpoints.setDefaultAddress(id)),
		meta: { showNotification: true },
		onSuccess: (list) => {
			queryClient.setQueryData(["me", "addresses"], list);
			refresh();
		},
	});

	const remove = useMutation({
		mutationFn: (id: number) => withMappedError(() => AccountEndpoints.deleteAddress(id)),
		meta: { showNotification: true },
		onSuccess: () => {
			refresh();
			toast("آدرس حذف شد", { icon: "trash" });
		},
	});

	const openModal = (address?: Address) => setModal((m) => ({ open: true, address, seq: m.seq + 1 }));
	const closeModal = () => setModal((m) => ({ ...m, open: false }));

	const addressesError = toErrorView(ERROR_BEHAVIOUR, addresses.error, "دریافت آدرس‌ها با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-addresses">
			<div className="p-head">
				<h2>آدرس‌های من</h2>
			</div>
			{addresses.isLoading ? (
				<Loading />
			) : !!addressesError ? (
				<ErrorComponent
					retryable={addressesError.retryable}
					ticketAble={addressesError.ticketAble}
					errorText={addressesError.errorText}
					executeFunction={() => addresses.refetch()}
					loading={addresses.isFetching}
				/>
			) : !addresses.error && !!addresses.data ? (
				<div className="addr-grid">
					{addresses.data.map((a) => {
						const busy = (makeDefault.isPending && makeDefault.variables === a.id) || (remove.isPending && remove.variables === a.id);
						return (
							<Reveal key={a.id} className={classNames("addr", { def: a.isDefault })} style={busy ? { opacity: 0.6 } : undefined}>
								<h4>
									<Icon name="pin" width={18} height={18} style={{ color: "var(--purple)" }} /> {a.cityName}
									{a.isDefault && <span className="tag">پیش‌فرض</span>}
								</h4>
								<p>
									{addressText(a)}
									<br />
									کد پستی: {toPersianDigits(a.postalCode)}
									<br />
									گیرنده: {a.recipientName} — {toPersianDigits(a.recipientPhone)}
								</p>
								<div className="acts">
									<button type="button" disabled={busy} onClick={() => openModal(a)}>
										<Icon name="edit" /> ویرایش
									</button>
									{!a.isDefault && (
										<button type="button" disabled={busy} onClick={() => makeDefault.mutate(a.id)}>
											<Icon name="check" /> پیش‌فرض کن
										</button>
									)}
									<button type="button" className="del" disabled={busy} onClick={() => remove.mutate(a.id)}>
										<Icon name="trash" /> حذف
									</button>
								</div>
							</Reveal>
						);
					})}
					<button type="button" className="add-card" id="addA" onClick={() => openModal()}>
						<Icon name="plus" /> افزودن آدرس جدید
					</button>
				</div>
			) : null}
			<Modal open={modal.open} onClose={closeModal} width={620}>
				{modal.seq > 0 && <AddressModalBody key={modal.seq} address={modal.address} onSaved={closeModal} />}
			</Modal>
		</div>
	);
}
