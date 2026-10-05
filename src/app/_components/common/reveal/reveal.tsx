"use client";

import { CSSProperties, ElementType, ReactNode, Ref, RefObject, useCallback } from "react";
import classNames from "classnames";
import { useReveal } from "@/hooks/useReveal";

type RevealProps = {
	as?: ElementType;
	className?: string;
	/** Stagger delay in seconds (`--d`). */
	delay?: number;
	style?: CSSProperties;
	children?: ReactNode;
	/** Forwarded alongside the reveal observer (e.g. a scroll row the page controls). */
	ref?: Ref<HTMLElement>;
	[key: string]: unknown;
};

/** Any element with the design's `.reveal` fade-up on first sight. */
export default function Reveal({ as: Tag = "div", className, delay, style, children, ref, ...rest }: RevealProps) {
	const [revealRef, shown] = useReveal<HTMLElement>();

	const mergedRef = useCallback(
		(node: HTMLElement | null) => {
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as RefObject<HTMLElement | null>).current = node;
			return revealRef(node);
		},
		[ref, revealRef],
	);

	return (
		<Tag
			ref={mergedRef}
			className={classNames(className, "reveal", { in: shown })}
			style={delay ? ({ "--d": `${delay}s`, ...style } as CSSProperties) : style}
			{...rest}
		>
			{children}
		</Tag>
	);
}
