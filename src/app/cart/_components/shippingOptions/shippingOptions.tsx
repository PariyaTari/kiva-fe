"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { ShippingMethodCode, ShippingOptionQuote } from "@/types/cart.type";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";

type ShippingOptionsProps = {
	options: ShippingOptionQuote[];
	selected: ShippingMethodCode;
};

/** «روش ارسال» block — `.opt-card` radios with the price (struck through when free). */
export default function ShippingOptions({ options, selected }: ShippingOptionsProps) {
	const queryClient = useQueryClient();

	const setMethod = useMutation({
		mutationFn: (method: ShippingMethodCode) => withMappedError(() => CartEndpoints.setShippingMethod(method)),
		meta: { showNotification: true },
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
	});

	// the radio follows the click right away
	const current = setMethod.isPending ? setMethod.variables : selected;

	return (
		<div className="block">
			<h3>
				<Icon name="truck" /> روش ارسال
			</h3>
			<div className="ship-opts">
				{options.map((o) => (
					<label key={o.method} className="opt-card">
						<input
							type="radio"
							name="ship"
							value={o.method}
							checked={current === o.method}
							disabled={!o.available}
							onChange={() => setMethod.mutate(o.method)}
						/>
						<span className="radio" />
						<span className="ic">
							<Icon name={o.icon ?? (o.method === "TIPAX" ? "truck" : "box")} />
						</span>
						<span>
							<span className="t">{o.name}</span>
							<span className="d" style={{ display: "block" }}>
								{o.available ? o.description : o.unavailableReason}
							</span>
						</span>
						<span className="end">
							{o.isFree ? (
								<>
									{!!o.baseCost && (
										<del className="muted" style={{ fontWeight: 400, fontSize: 12 }}>
											{formatPrice(o.baseCost)}
										</del>
									)}{" "}
									<span className="free">رایگان</span>
								</>
							) : (
								<>
									{formatPrice(o.cost)} <small className="muted">تومان</small>
								</>
							)}
						</span>
					</label>
				))}
			</div>
		</div>
	);
}
