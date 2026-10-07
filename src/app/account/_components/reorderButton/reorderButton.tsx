"use client";

import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { useUiStore } from "@/store/ui.store";
import { OrderSummary } from "@/types/order.type";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { itemsLabel } from "../../_utils/orderActions";

type ReorderButtonProps = {
	order: OrderSummary;
	/** Button style, e.g. `btn-dark btn-sm` on the card, `btn-primary btn-block` in a modal. */
	className: string;
	onDone?: () => void;
};

/** «خرید دوباره» of an expired / cancelled order — the bags still in stock go back to the cart. */
export default function ReorderButton({ order, className, onDone }: ReorderButtonProps) {
	const queryClient = useQueryClient();

	const reorder = useMutation({
		mutationFn: () => withMappedError(() => AccountEndpoints.reorder(order.code)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			onDone?.();
			const openCart = { label: "مشاهده سبد", onClick: () => useUiStore.getState().open("cart") };
			// some bags sold out meanwhile — the server's message names them
			if (!res.addedCount) return toast(res.message, { type: "warning", duration: 6000 });
			if (res.skipped?.length) return toast(res.message, { icon: "info", duration: 6000, action: openCart });
			toast(`${itemsLabel(order)} دوباره به سبدت اضافه شد`, { icon: "bag", action: openCart });
		},
	});

	return (
		<button type="button" className={classNames("btn", className, { loading: reorder.isPending })} onClick={() => reorder.mutate()}>
			<Icon name="bag" /> خرید دوباره
		</button>
	);
}
