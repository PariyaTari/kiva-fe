"use client";

import { useCallback, useState } from "react";

type Listener = () => void;

let observer: IntersectionObserver | null = null;
const listeners = new WeakMap<Element, Listener>();

function sharedObserver(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries) =>
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				listeners.get(entry.target)?.();
				listeners.delete(entry.target);
				observer?.unobserve(entry.target);
			}),
		{ threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
	);
	return observer;
}

/**
 * The design's scroll reveal (`K.reveal`): returns a ref and whether the element has been seen.
 * Render `className="… reveal"` plus `in` once `shown` — elements already on screen reveal right away.
 */
export function useReveal<T extends Element>(): [(node: T | null) => (() => void) | void, boolean] {
	const [shown, setShown] = useState(false);

	const ref = useCallback(
		(node: T | null) => {
			if (!node || shown) return;
			if (typeof IntersectionObserver === "undefined") {
				const t = setTimeout(() => setShown(true), 0);
				return () => clearTimeout(t);
			}
			const r = node.getBoundingClientRect();
			if (r.top < window.innerHeight * 0.95 && r.bottom > 0) {
				const t = setTimeout(() => setShown(true), 40);
				return () => clearTimeout(t);
			}
			listeners.set(node, () => setShown(true));
			sharedObserver().observe(node);
			return () => {
				listeners.delete(node);
				observer?.unobserve(node);
			};
		},
		[shown],
	);

	return [ref, shown];
}
