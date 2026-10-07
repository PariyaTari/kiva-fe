/** Mirrors the CMS page contract (kiva-openapi.yml · Content · `StaticPage`). */
import { SeoMeta } from "@/types/catalog.type";

/** «قوانین و حریم خصوصی», «شرایط بازگشت», … — `/pages/{slug}`. */
export interface StaticPage {
	slug: string;
	title: string;
	/** Sanitized on the server (`p, b, strong, em, a, ul, ol, li, br, mark, h2, h3, blockquote`). */
	content: string;
	updatedAt?: string;
	seo?: SeoMeta;
}
