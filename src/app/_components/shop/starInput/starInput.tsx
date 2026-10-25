import { ChangeEvent, Fragment } from "react";
import { toPersianDigits } from "@/utils/digits";

const STAR = "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z";

type StarInputProps = {
	/** `"1"`…`"5"` — the radio value, as a form keeps it. */
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	name?: string;
	/** Prefix of the radios' ids — two inputs on one page (the product form and an edit modal) mustn't share them. */
	idPrefix?: string;
};

/** `.rate-in` — the design's five-star picker of the review form (product page, and editing in «نظرات من»). */
export default function StarInput({ value, onChange, name = "rating", idPrefix = "r" }: StarInputProps) {
	return (
		<div className="rate-in" role="radiogroup" aria-label="امتیاز">
			{[5, 4, 3, 2, 1].map((s) => (
				// input + label stay siblings — the hover / checked colouring uses `~`
				<Fragment key={s}>
					<input type="radio" name={name} id={`${idPrefix}${s}`} value={s} checked={value === String(s)} onChange={onChange} />
					<label htmlFor={`${idPrefix}${s}`} title={`${toPersianDigits(s)} ستاره`}>
						<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
							<path d={STAR} />
						</svg>
					</label>
				</Fragment>
			))}
		</div>
	);
}
