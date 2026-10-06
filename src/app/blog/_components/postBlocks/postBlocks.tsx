import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { formatPrice } from "@/utils/format";
import { BlogContentBlock } from "../../_types/blog.type";

/** One article block, drawn with the design's prose markup (`h2`, `p`, `blockquote`, `.tip`, `.inline-prod`). */
function Block({ block }: { block: BlogContentBlock }) {
	switch (block.type) {
		case "HEADING":
			return <h2 id={block.anchor ?? undefined}>{block.text}</h2>;
		case "PARAGRAPH":
			return block.html ? <p dangerouslySetInnerHTML={{ __html: block.html }} /> : <p>{block.text}</p>;
		case "QUOTE":
			return (
				<blockquote>
					<Icon name="quote" />
					{block.text}
				</blockquote>
			);
		case "TIP":
			return (
				<div className="box-cream tip">
					<span className="ic">
						<Icon name="sparkle" />
					</span>
					<div>
						<b>{block.title ?? "نکته کیوا"}</b>
						<p>{block.text}</p>
					</div>
				</div>
			);
		case "PRODUCT": {
			const p = block.product;
			if (!p) return null;
			return (
				<Link className="inline-prod" href={`/product/${p.slug}`}>
					<span className="th">
						<MediaImage src={p.image?.url} alt={p.image?.alt ?? p.name} />
					</span>
					<span>
						<b>{p.name}</b>
						<small>
							{formatPrice(p.price.price)} تومان · {p.category?.name}
						</small>
					</span>
					<span className="btn btn-soft btn-sm">مشاهده محصول</span>
				</Link>
			);
		}
		case "IMAGE":
			return block.image ? (
				<figure style={{ margin: "28px 0", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
					<MediaImage src={block.image.url} alt={block.image.alt} cover />
				</figure>
			) : null;
		case "LIST":
			return (
				<ul style={{ margin: "0 0 14px", paddingInlineStart: 22, listStyle: "disc" }}>
					{block.items?.map((item, i) => (
						<li key={i}>{item}</li>
					))}
				</ul>
			);
		default:
			return null;
	}
}

/** `.prose` — the lead paragraph and the article blocks. */
export default function PostBlocks({ lead, blocks }: { lead?: string; blocks: BlogContentBlock[] }) {
	return (
		<>
			{lead && <p className="lead">{lead}</p>}
			{blocks.map((block, i) => (
				<Block key={block.anchor ?? i} block={block} />
			))}
		</>
	);
}
