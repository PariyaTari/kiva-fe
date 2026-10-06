/** Step ۴ — the drawn check and «سلام …، خوش اومدی!» while the redirect happens. */
export default function DoneStep({ name }: { name: string }) {
	return (
		<div className="astep adone on" id="s4">
			<div className="ck">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
					<path d="M5 12.5l4.5 4.5L19 7.5" />
				</svg>
			</div>
			<h1 id="hello">{name ? `سلام ${name}، خوش اومدی!` : "وارد شدی!"}</h1>
			<p className="muted">در حال انتقال…</p>
		</div>
	);
}
