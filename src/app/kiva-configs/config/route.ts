import { SITE_CONFIG } from "@/config/site";

// fixed content of this project — built once, served as a static file
export const dynamic = "force-static";

/** `GET /kiva-configs/config` — the storefront's settings (`SiteConfig` shape), instead of the backend's `GET /config`. */
export function GET() {
	return Response.json(SITE_CONFIG);
}
