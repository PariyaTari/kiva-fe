import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/global";
import { absoluteUrl } from "@/utils/seo";

/** `/robots.txt` — personal pages and the app's own JSON stay out of crawling (pages also carry `noindex`); the sitemap is announced. */
export default function robots(): MetadataRoute.Robots {
	return {
		// `/kiva-configs/{config,home}` are JSON for the app itself (the hero picture beside them stays crawlable)
		rules: [{ userAgent: "*", allow: "/", disallow: ["/account", "/cart", "/checkout", "/login", "/wishlist", "/kiva-configs/config", "/kiva-configs/home"] }],
		sitemap: absoluteUrl("/sitemap.xml"),
		host: SITE_URL,
	};
}
