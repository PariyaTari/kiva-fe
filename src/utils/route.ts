/** Route params can arrive still percent-encoded (non-Latin slugs); a stray `%` must not crash the page. */
export function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
