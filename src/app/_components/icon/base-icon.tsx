"use client";

import { svgIcon } from "./icon.types";

export const BaseIcon: React.FC<svgIcon> = ({
	color = "currentColor",
	width = 24,
	height = 24,
	strokeWidth = "1.7",
	viewBox = "0 0 24 24",
	children,
	...rest
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke={color}
			width={width}
			height={height}
			strokeWidth={strokeWidth}
			viewBox={viewBox}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...rest}
		>
			{children}
		</svg>
	);
};
