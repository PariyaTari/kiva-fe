import { HERO_ART } from "@/app/(home)/_utils/homeContent";
import { bagMarkup } from "@/app/_components/shop/bagArt/bagMarkup";

// a fixed picture of this project — drawn once at build time, served as a static file
export const dynamic = "force-static";

/**
 * The design's markup repeats `stroke-width` on some shapes. Inline in HTML the first one wins; a standalone .svg is
 * strict XML, where a duplicate attribute breaks the whole picture — so keep the first (same fix as `mock/art.mjs`).
 */
function dedupeAttributes(svg: string) {
	return svg.replace(/<([a-zA-Z]+)((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*(\/?)>/g, (_, tag: string, attrs: string, selfClose: string) => {
		const seen = new Set<string>();
		const kept = attrs.replace(/\s+([a-zA-Z:-]+)="[^"]*"/g, (attr, name: string) => (seen.has(name) ? "" : (seen.add(name), attr)));
		return `<${tag}${kept}${selfClose}>`;
	});
}

/** `GET /kiva-configs/hero.svg` — the home hero's picture (the design's illustrated bag), for both cards of the visual. */
export function GET() {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${bagMarkup(HERO_ART.bag, HERO_ART.color, 0, "hero")}</svg>`;
	return new Response(dedupeAttributes(svg), { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}
