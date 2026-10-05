import { CSSProperties } from "react";

const STAR = "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z";

type StarsProps = {
	/** Rounded to whole stars like the design. */
	value: number;
	/** Outlined «off» stars (product reviews) vs. only filled ones. */
	outlined?: boolean;
	/** Fill the «on» stars via style (account reviews / review summary markup). */
	fillOn?: boolean;
	starStyle?: CSSProperties;
};

/** The design's rating stars (`stars(n)` in product/account pages). */
export default function Stars({ value, outlined = true, fillOn = false, starStyle }: StarsProps) {
	const on = Math.round(value);
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) =>
				outlined ? (
					<svg
						key={i}
						viewBox="0 0 24 24"
						className={i <= on ? "" : "off"}
						stroke="currentColor"
						strokeWidth="1.5"
						style={fillOn ? { fill: i <= on ? "currentColor" : "none", ...starStyle } : starStyle}
						aria-hidden="true"
					>
						<path d={STAR} />
					</svg>
				) : (
					<svg key={i} viewBox="0 0 24 24" style={starStyle} aria-hidden="true">
						<path d={STAR} />
					</svg>
				),
			)}
		</>
	);
}
