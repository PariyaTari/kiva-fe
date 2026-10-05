"use client";

import { KeyboardEvent, useState } from "react";
import { digitsOnly } from "@/utils/digits";
import { formatPrice } from "@/utils/format";

type PriceRangeProps = {
	/** Dynamic bounds from the facets (cheapest / most expensive product right now). */
	min: number;
	max: number;
	step: number;
	value: [number, number];
	onChange: (value: [number, number]) => void;
	/** Enter inside a price box applies the filters (design) — gets the range it just committed. */
	onEnter?: (value: [number, number]) => void;
};

/** `.range` dual slider + «از / تا» boxes; the boxes commit on blur / Enter. */
export default function PriceRange({ min, max, step, value, onChange, onEnter }: PriceRangeProps) {
	const [lo, hi] = value;
	// text being typed in a box (null = show the formatted committed value)
	const [draft, setDraft] = useState<{ which: "lo" | "hi"; text: string } | null>(null);

	const span = Math.max(1, max - min);
	const left = ((lo - min) / span) * 100;
	const right = 100 - ((hi - min) / span) * 100;

	const commit = (which: "lo" | "hi"): [number, number] => {
		if (!draft || draft.which !== which) return value;
		const n = Number(digitsOnly(draft.text).en) || 0;
		const next: [number, number] = which === "lo" ? [Math.max(min, Math.min(n || min, hi - step)), hi] : [lo, Math.min(max, Math.max(n || max, lo + step))];
		onChange(next);
		setDraft(null);
		return next;
	};

	const onKey = (which: "lo" | "hi") => (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;
		const next = commit(which);
		onEnter?.(next);
	};

	const box = (which: "lo" | "hi") => (draft?.which === which ? draft.text : formatPrice(which === "lo" ? lo : hi));

	return (
		<>
			<div className="range" id="range">
				<div className="rail" />
				<div className="fill" id="rFill" style={{ left: `${left}%`, right: `${right}%` }} />
				<input
					type="range"
					id="rMin"
					aria-label="حداقل قیمت"
					min={min}
					max={max}
					step={step}
					value={lo}
					onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
				/>
				<input
					type="range"
					id="rMax"
					aria-label="حداکثر قیمت"
					min={min}
					max={max}
					step={step}
					value={hi}
					onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
				/>
			</div>
			<div className="price-vals">
				<div className="field">
					<label htmlFor="pMin">از</label>
					<input
						className="input"
						id="pMin"
						inputMode="numeric"
						value={box("lo")}
						onChange={(e) => setDraft({ which: "lo", text: formatPrice(Number(digitsOnly(e.target.value).en) || 0) })}
						onBlur={() => commit("lo")}
						onKeyDown={onKey("lo")}
					/>
				</div>
				<div className="field">
					<label htmlFor="pMax">تا</label>
					<input
						className="input"
						id="pMax"
						inputMode="numeric"
						value={box("hi")}
						onChange={(e) => setDraft({ which: "hi", text: formatPrice(Number(digitsOnly(e.target.value).en) || 0) })}
						onBlur={() => commit("hi")}
						onKeyDown={onKey("hi")}
					/>
				</div>
			</div>
			<div className="price-hint">
				<span id="hMin">کمترین: {formatPrice(min)}</span>
				<span id="hMax">بیشترین: {formatPrice(max)}</span>
			</div>
		</>
	);
}
