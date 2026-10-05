export type LogoTone = "brand" | "white";

export type LogoProps = {
	/** `true` → the full "kiva" wordmark; `false` → the square app mark (same as the favicon). */
	withWordmark?: boolean;
	/** `white` is for dark surfaces such as the footer. */
	tone?: LogoTone;
	className?: string;
	markClassName?: string;
};
