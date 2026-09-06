/**
 * JavaScript Minifier — removes comments, collapses whitespace.
 * Basic minification only (no AST-based optimization).
 */

export function minifyJs(js: string): string {
  if (!js.trim()) return ''

  let result = js
    // Remove single-line comments (// ...) — but not URLs with //
    .replace(/(?<!:)\/\/(?!\/).*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove leading/trailing whitespace from each line
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple whitespace characters
    .replace(/\s{2,}/g, ' ')
    // Remove spaces around operators (basic cases)
    .replace(/\s*([{}();,=:<>!&|?+\-*/%])\s*/g, '$1')
    // Restore spaces where needed for keywords
    .replace(/(typeof|instanceof|in|of|new|delete|void|return|throw|case|yield)\s*/g, '$1 ')
    // Fix cases where keywords merge with identifiers
    .replace(/(\w)(typeof|instanceof|new|return)/g, '$1 $2')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove newlines
    .replace(/\n/g, '')
    .trim()

  return result
}

export interface JsSizeComparison {
  original: number
  result: number
  saved: number
  savedPercent: number
}

export function compareSizes(original: string, result: string): JsSizeComparison {
  const originalSize = new Blob([original]).size
  const resultSize = new Blob([result]).size
  const saved = originalSize - resultSize
  const savedPercent = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0

  return { original: originalSize, result: resultSize, saved, savedPercent }
}
