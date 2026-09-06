/**
 * HTML Minifier — removes comments, collapses whitespace, removes empty attributes.
 */

export function minifyHtml(html: string): string {
  if (!html.trim()) return ''

  return html
    // Remove HTML comments (but not conditional comments)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    // Remove leading/trailing whitespace from each line
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple whitespace characters to a single space
    .replace(/\s{2,}/g, ' ')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove whitespace inside opening tags: < tag → <tag
    .replace(/<\s+/g, '<')
    // Remove whitespace before closing tag
    .replace(/\s+>/g, '>')
    // Remove empty attributes (attr="")
    .replace(/\s+[a-z-]+=""\s*/gi, ' ')
    // Remove optional quotes around attribute values (simple cases)
    // Remove spaces around = in attributes
    .replace(/\s*=\s*/g, '=')
    // Remove type="text/javascript" from script tags
    .replace(/\s*type="text\/javascript"/gi, '')
    // Remove type="text/css" from style tags
    .replace(/\s*type="text\/css"/gi, '')
    // Clean up multiple spaces that may have been introduced
    .replace(/\s{2,}/g, ' ')
    // Remove space before self-closing slash
    .replace(/\s+\/>/g, '/>')
    .trim()
}

export interface HtmlSizeComparison {
  original: number
  result: number
  saved: number
  savedPercent: number
}

export function compareSizes(original: string, result: string): HtmlSizeComparison {
  const originalSize = new Blob([original]).size
  const resultSize = new Blob([result]).size
  const saved = originalSize - resultSize
  const savedPercent = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0

  return { original: originalSize, result: resultSize, saved, savedPercent }
}
