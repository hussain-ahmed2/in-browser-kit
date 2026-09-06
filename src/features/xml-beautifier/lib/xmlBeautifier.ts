export function formatXml(xml: string, indent: number = 2): string {
  if (!xml.trim()) return ''

  const pad = ' '.repeat(indent)
  let formatted = ''
  let level = 0
  const lines = xml.replace(/>\s*</g, '><').split(/(<[^>]+>)/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
      formatted += pad.repeat(level) + trimmed + '\n'
    } else if (trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
      formatted += trimmed + '\n'
    } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>')) {
      formatted += pad.repeat(level) + trimmed + '\n'
      level++
    } else if (trimmed.endsWith('/>')) {
      formatted += pad.repeat(level) + trimmed + '\n'
    } else {
      formatted += pad.repeat(level) + trimmed + '\n'
    }
  }

  return formatted.trimEnd()
}

export interface XmlValidationResult {
  valid: boolean
  error?: string
}

export function validateXml(xml: string): XmlValidationResult {
  if (!xml.trim()) {
    return { valid: false, error: 'Empty input' }
  }

  // Try DOMParser first (browser environment)
  try {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      const parseError = doc.querySelector('parsererror')

      if (parseError) {
        const errorText = parseError.textContent || 'Invalid XML'
        return { valid: false, error: errorText.trim() }
      }

      return { valid: true }
    }
  } catch {
    // Fall through to regex-based validation
  }

  // Regex-based validation for Node.js environments
  try {
    // Check for basic XML structure
    const tagStack: string[] = []
    const selfClosingTags = /<(?!\/)(\w[\w.-]*)((?:\s+[^>]*?)?)(\/?>)/g
    const closingTags = /<\/(\w[\w.-]*)>/g
    const openTags = /<(\w[\w.-]*)((?:\s+[^>]*?)?)(?!\/)>/g

    // Remove XML declaration and comments
    const cleaned = xml
      .replace(/<\?[\s\S]*?\?>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')

    // Extract opening and closing tags
    let match: RegExpExecArray | null

    // Simple tag matching
    const openTagRegex = /<([a-zA-Z_][\w.-]*)((?:\s+[^>]*?)?)(?!\/)>/g
    const closeTagRegex = /<\/([a-zA-Z_][\w.-]*)>/g

    const openTagsFound: string[] = []
    const closeTagsFound: string[] = []

    while ((match = openTagRegex.exec(cleaned)) !== null) {
      openTagsFound.push(match[1])
    }
    while ((match = closeTagRegex.exec(cleaned)) !== null) {
      closeTagsFound.push(match[1])
    }

    // Check that tags are properly nested (simplified check)
    if (openTagsFound.length > 0 || closeTagsFound.length > 0) {
      // If there are closing tags, they should match opening tags count
      if (closeTagsFound.length !== openTagsFound.length) {
        return { valid: false, error: 'Mismatched opening and closing tags' }
      }
    }

    // Check for unclosed angle brackets
    const angleBracketCount = (xml.match(/</g) || []).length
    const angleCloseCount = (xml.match(/>/g) || []).length
    if (angleBracketCount !== angleCloseCount) {
      return { valid: false, error: 'Mismatched angle brackets' }
    }

    // Basic well-formedness: must have at least one tag
    if (!/<[^>]+>/.test(xml)) {
      return { valid: false, error: 'No XML tags found' }
    }

    return { valid: true }
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid XML',
    }
  }
}
