import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/global";
import { absoluteUrl } from "@/utils/seo";

/** `/robots.txt` — personal pages stay out of crawling (they also carry `noindex`), the sitemap is announced. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/", disallow: ["/account", "/cart", "/checkout", "/login", "/wishlist"] }],
		sitemap: absoluteUrl("/sitemap.xml"),
		host: SITE_URL,
	};
}
