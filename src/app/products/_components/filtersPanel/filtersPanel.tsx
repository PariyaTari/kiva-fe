"use client";

import { useState } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import MultiSelect from "@/app/_components/ui/multiSelect/multiSelect";
import Switch from "@/app/_components/ui/switch/switch";
import PriceRange from "../priceRange/priceRange";
import { ProductFacets, ProductFilters } from "../../_types/products.type";
import { sameFilters } from "../../_utils/filters";

type FiltersPanelProps = {
	applied: ProductFilters;
	facets?: ProductFacets | null;
	/** Bottom sheet state below 900px. */
	open: boolean;
	onClose: () => void;
	onApply: (filters: ProductFilters) => void;
	onReset: () => void;
};

/** `.filters` — edits a staged copy; «اعمال فیلترها» commits it (the button shows a dot while it differs). */
export default function FiltersPanel({ applied, facets, open, onClose, onApply, onReset }: FiltersPanelProps) {
	const [staged, setStaged] = useState(applied);
	const [prevApplied, setPrevApplied] = useState(applied);

	// applied changed from outside (chip removed, quick category) → the panel mirrors it again
	if (!sameFilters(applied, prevApplied)) {
		setPrevApplied(applied);
		setStaged(applied);
	}

	const set = (patch: Partial<ProductFilters>) => setStaged((s) => ({ ...s, ...patch }));
	// `patch` = a value committed in the same event (Enter in a price box) that `staged` doesn't hold yet
	const apply = (patch: Partial<ProductFilters> = {}) => onApply({ ...staged, ...patch });

	const bounds = facets?.price;
	const priceValue: [number, number] | null = bounds ? [staged.minPrice ?? bounds.min, staged.maxPrice ?? bounds.max] : null;
	// the full range means «no price filter»
	const pricePatch = ([lo, hi]: [number, number]) => ({ minPrice: bounds && lo > bounds.min ? lo : null, maxPrice: bounds && hi < bounds.max ? hi : null });

	return (
		<aside className={classNames("filters", { on: open })} id="filters" aria-label="فیلترها">
			<div className="f-head">
				<h3>
					<Icon name="filter" /> فیلترها
				</h3>
				<button type="button" className="icon-btn f-open" aria-label="بستن" onClick={onClose}>
					<Icon name="close" />
				</button>
			</div>
			<div className="f-sec">
				<label htmlFor="fq">جستجو</label>
				<div style={{ position: "relative" }}>
					<input
						className="input"
						id="fq"
						type="search"
						placeholder="اسم، رنگ یا دسته‌بندی…"
						style={{ paddingInlineStart: 42 }}
						value={staged.q}
						onChange={(e) => set({ q: e.target.value })}
						onKeyDown={(e) => e.key === "Enter" && apply()}
					/>
					<span className="sic" style={{ position: "absolute", top: 15, right: 14, width: 20, color: "var(--ink-50)" }}>
						<Icon name="search" />
					</span>
				</div>
			</div>
			<div className="f-sec">
				<span className="lbl">دسته‌بندی</span>
				<MultiSelect
					id="fCat"
					placeholder="تایپ کن یا انتخاب کن…"
					options={(facets?.categories ?? []).map((c) => ({ value: c.value, label: c.label, count: c.count }))}
					value={staged.category}
					onChange={(category) => set({ category })}
				/>
			</div>
			<div className="f-sec">
				<span className="lbl">رنگ</span>
				<MultiSelect
					id="fColor"
					placeholder="مثلاً مشکی، کرم…"
					options={(facets?.colors ?? []).map((c) => ({ value: c.value, label: c.label, count: c.count, swatch: c.hex }))}
					value={staged.color}
					onChange={(color) => set({ color })}
				/>
				<p className="help muted" style={{ fontSize: 11.5, marginTop: 8 }}>
					با انتخاب رنگ، عکس اول محصولات به همون رنگ تغییر می‌کنه.
				</p>
			</div>
			<div className="f-sec">
				<span className="lbl">
					محدوده قیمت{" "}
					<small className="muted" style={{ fontWeight: 400 }}>
						(تومان)
					</small>
				</span>
				{bounds && priceValue && (
					<PriceRange
						min={bounds.min}
						max={bounds.max}
						step={bounds.step}
						value={priceValue}
						onChange={(range) => set(pricePatch(range))}
						onEnter={(range) => apply(pricePatch(range))}
					/>
				)}
			</div>
			<div className="f-sec">
				<Switch id="fSale" label="فقط تخفیف‌خورده‌ها" checked={staged.onSale} onChange={(e) => set({ onSale: e.target.checked })} />
				<Switch id="fStock" label="فقط کالاهای موجود" checked={staged.inStock} onChange={(e) => set({ inStock: e.target.checked })} />
			</div>
			<div className="f-actions">
				<button type="button" className={classNames("btn btn-primary", { dirty: !sameFilters(staged, applied) })} id="apply" onClick={() => apply()}>
					اعمال فیلترها
				</button>
				<button type="button" className="btn btn-outline" id="reset" title="حذف همه فیلترها" onClick={onReset}>
					حذف فیلترها
				</button>
			</div>
		</aside>
	);
}
