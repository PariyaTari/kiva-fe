/** The design's fly-to-cart (`K.fly`): a copy of the product image arcs into the header cart button. */
export function flyToCart(from: Element | null | undefined) {
	if (typeof window === "undefined" || !from) return;
	const target = document.querySelector("#kvCartBtn .ico");
	const src = from.querySelector("img,svg") ?? from;
	if (!target || !("animate" in src)) return;

	const a = src.getBoundingClientRect();
	const b = target.getBoundingClientRect();
	const clone = src.cloneNode(true) as HTMLElement;
	const size = Math.min(a.width, 160);
	Object.assign(clone.style, {
		position: "fixed",
		zIndex: "300",
		left: `${a.left + (a.width - size) / 2}px`,
		top: `${a.top + (a.height - size) / 2}px`,
		width: `${size}px`,
		height: `${size}px`,
		pointerEvents: "none",
		objectFit: "contain",
	});
	document.body.appendChild(clone);

	const dx = b.left + b.width / 2 - (a.left + a.width / 2);
	const dy = b.top + b.height / 2 - (a.top + a.height / 2);
	clone.animate(
		[
			{ transform: "translate(0,0) scale(1)", opacity: 1 },
			{ transform: `translate(${dx * 0.45}px,${dy * 0.45 - 80}px) scale(.55) rotate(-12deg)`, opacity: 1, offset: 0.45 },
			{ transform: `translate(${dx}px,${dy}px) scale(.12) rotate(-20deg)`, opacity: 0.4 },
		],
		{ duration: 850, easing: "cubic-bezier(.5,0,.3,1)" },
	).onfinish = () => clone.remove();
}
