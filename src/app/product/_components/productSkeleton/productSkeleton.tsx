import { CSSProperties } from "react";

const line = (width: CSSProperties["width"], height: number, extra?: CSSProperties): CSSProperties => ({ width, height, borderRadius: 10, ...extra });

/** First load of the product page — the gallery / info grid with shimmering blocks. */
export default function ProductSkeleton() {
	return (
		<main className="pd-top" aria-busy="true">
			<div className="container">
				<nav className="crumbs" aria-hidden="true">
					<span className="kv-skel" style={line(240, 14)} />
				</nav>
				<div className="pd">
					<div className="gal">
						<div className="thumbs">
							{Array.from({ length: 4 }, (_, i) => (
								<div key={i} className="thumb kv-skel" />
							))}
						</div>
						<div className="main-img kv-skel" />
					</div>
					<div className="info">
						<span className="kv-skel" style={line(90, 30, { display: "block", borderRadius: 999, marginBottom: 14 })} />
						<span className="kv-skel" style={line("70%", 38, { display: "block", marginBottom: 14 })} />
						<span className="kv-skel" style={line("55%", 16, { display: "block" })} />
						<div className="kv-skel" style={line("100%", 96, { margin: "22px 0", borderRadius: 24 })} />
						<span className="kv-skel" style={line(120, 16, { display: "block", marginBottom: 14 })} />
						<div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
							{Array.from({ length: 4 }, (_, i) => (
								<span key={i} className="kv-skel" style={line(44, 44, { borderRadius: "50%" })} />
							))}
						</div>
						<div className="kv-skel" style={line("100%", 56, { borderRadius: 999 })} />
					</div>
				</div>
			</div>
		</main>
	);
}
