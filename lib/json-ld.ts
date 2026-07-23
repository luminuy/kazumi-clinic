/**
 * Serialize a value for embedding inside a `<script type="application/ld+json">` element.
 *
 * JSON.stringify does NOT escape "<", so any field whose value can contain "</script>" (e.g. a blog
 * title or excerpt edited through /admin and stored in D1) would close the script element early and
 * let the rest of the string be parsed as HTML — a stored XSS. Escaping "<" keeps the payload inside
 * the JSON string; the JSON meaning is unchanged because a JSON parser reads it as "<". U+2028 and
 * U+2029 are also escaped: valid in JSON, but line terminators in a <script> context.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(new RegExp('[\\u2028\\u2029]', 'g'), (c) => '\\u' + c.charCodeAt(0).toString(16));
}
