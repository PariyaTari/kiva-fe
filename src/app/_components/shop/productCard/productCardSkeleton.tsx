/** Placeholder card while a product grid loads for the first time (`isLoading`). */
export default function ProductCardSkeleton() {
	return (
		<article className="pcard is-skel" aria-hidden="true">
			<div className="pcard-top">
				<div className="pcard-media" />
			</div>
			<div className="pcard-body">
				<div className="pcard-colors">
					<span className="kv-skel" style={{ width: 70, height: 14 }} />
				</div>
				<span className="kv-skel" style={{ width: "72%", height: 18, display: "block" }} />
				<span className="kv-skel" style={{ width: "40%", height: 14, display: "block", marginTop: 6 }} />
				<span className="kv-skel" style={{ width: "50%", height: 18, display: "block", marginTop: 10 }} />
			</div>
		</article>
	);
}
