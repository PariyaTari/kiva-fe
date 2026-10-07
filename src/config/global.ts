/**
 * API base. The server (page prefetch) may reach the API on a private address — `API_INTERNAL_URL`
 * (not `NEXT_PUBLIC_`, so it never reaches the browser bundle); the browser always uses the public one.
 */
export const API_URL = (typeof window === "undefined" && process.env.API_INTERNAL_URL) || process.env.NEXT_PUBLIC_API_URL;
/** Public origin of the storefront — canonical links, Open Graph, sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100").replace(/\/+$/, "");

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
