/**
 * schema.org structured data. `<` is escaped so text from the API can never close the script tag.
 * Server component — rendered into the page HTML for crawlers.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
