export function minifyCss(css: string): string {
  if (!css.trim()) return ''

  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove newlines
    .replace(/\n/g, '')
    // Remove leading/trailing whitespace on each line
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Remove spaces around selectors and properties
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove spaces after commas
    .replace(/,\s*/g, ',')
    // Trim
    .trim()
}

export function beautifyCss(css: string): string {
  if (!css.trim()) return ''

  let result = ''
  let indent = 0
  const indentStr = '  '

  // Remove comments first, then re-add formatted ones
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '')

  // Normalize whitespace
  const normalized = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' { ')
    .replace(/\s*}\s*/g, ' } ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*,\s*/g, ', ')
    .trim()

  const chars = normalized.split('')
  let i = 0

  while (i < chars.length) {
    const char = chars[i]

    if (char === '{') {
      result += ' {\n'
      indent++
      result += indentStr.repeat(indent)
    } else if (char === '}') {
      result = result.trimEnd()
      result += '\n'
      indent = Math.max(0, indent - 1)
      result += indentStr.repeat(indent) + '}\n'
      if (indent === 0) result += '\n'
    } else if (char === ';') {
      result += ';\n'
      result += indentStr.repeat(indent)
    } else {
      result += char
    }

    i++
  }

  // Clean up excess blank lines
  return result.replace(/\n{3,}/g, '\n\n').trim()
}

export interface CssSizeComparison {
  original: number
  result: number
  saved: number
  savedPercent: number
}

export function compareSizes(original: string, result: string): CssSizeComparison {
  const originalSize = new Blob([original]).size
  const resultSize = new Blob([result]).size
  const saved = originalSize - resultSize
  const savedPercent = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0

  return { original: originalSize, result: resultSize, saved, savedPercent }
}
