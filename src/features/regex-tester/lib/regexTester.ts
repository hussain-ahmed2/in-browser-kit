export type RegexFlags = 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export interface RegexMatch {
  match: string
  index: number
  groups: Record<string, string>
  indices: [number, number][]
}

export interface RegexTestResult {
  matches: RegexMatch[]
  error: string | null
  fullMatch: boolean
}

export function testRegex(
  pattern: string,
  flags: string,
  testString: string
): RegexTestResult {
  if (!pattern) {
    return { matches: [], error: null, fullMatch: false }
  }

  try {
    const regex = new RegExp(pattern, flags)
    const matches: RegexMatch[] = []
    let match: RegExpExecArray | null

    // For global flag, use exec in a loop
    if (flags.includes('g')) {
      regex.lastIndex = 0
      while ((match = regex.exec(testString)) !== null) {
        const groups: Record<string, string> = {}
        if (match.groups) {
          for (const [key, value] of Object.entries(match.groups)) {
            groups[key] = value
          }
        }

        const indices: [number, number][] = []
        if (match.indices) {
          for (const [start, end] of match.indices) {
            indices.push([start, end])
          }
        } else {
          const start = match.index
          const end = match.index + match[0].length
          indices.push([start, end])
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups,
          indices,
        })
      }
    } else {
      // Single match
      match = regex.exec(testString)
      if (match) {
        const groups: Record<string, string> = {}
        if (match.groups) {
          for (const [key, value] of Object.entries(match.groups)) {
            groups[key] = value
          }
        }

        const indices: [number, number][] = []
        if (match.indices) {
          for (const [start, end] of match.indices) {
            indices.push([start, end])
          }
        } else {
          const start = match.index
          const end = match.index + match[0].length
          indices.push([start, end])
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups,
          indices,
        })
      }
    }

    const fullMatch = matches.length > 0 && matches[0].index === 0 && matches[0].match.length === testString.length

    return { matches, error: null, fullMatch }
  } catch (e) {
    return {
      matches: [],
      error: e instanceof Error ? e.message : 'Invalid regular expression',
      fullMatch: false,
    }
  }
}

export function replaceRegex(
  pattern: string,
  flags: string,
  testString: string,
  replacement: string
): string {
  if (!pattern) return testString

  try {
    const regex = new RegExp(pattern, flags)
    return testString.replace(regex, replacement)
  } catch {
    return testString
  }
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const FLAG_DESCRIPTIONS: Record<RegexFlags, string> = {
  g: 'Global - find all matches',
  i: 'Ignore case',
  m: 'Multiline - ^ and $ match start/end of line',
  s: 'DotAll - . matches newline',
  u: 'Unicode - enable Unicode matching',
  y: 'Sticky - match only from lastIndex',
}

export const FLAG_OPTIONS = [
  { value: 'g', label: 'Global (g)' },
  { value: 'i', label: 'Ignore case (i)' },
  { value: 'm', label: 'Multiline (m)' },
  { value: 's', label: 'DotAll (s)' },
  { value: 'u', label: 'Unicode (u)' },
  { value: 'y', label: 'Sticky (y)' },
]

export const CHEATSHEET = [
  { pattern: '.', description: 'Any character except newline' },
  { pattern: '\\d', description: 'Digit (0-9)' },
  { pattern: '\\D', description: 'Non-digit' },
  { pattern: '\\w', description: 'Word character (a-z, A-Z, 0-9, _)' },
  { pattern: '\\W', description: 'Non-word character' },
  { pattern: '\\s', description: 'Whitespace (space, tab, newline)' },
  { pattern: '\\S', description: 'Non-whitespace' },
  { pattern: '\\b', description: 'Word boundary' },
  { pattern: '\\B', description: 'Non-word boundary' },
  { pattern: '^', description: 'Start of string (or line with m flag)' },
  { pattern: '$', description: 'End of string (or line with m flag)' },
  { pattern: '*', description: 'Zero or more (greedy)' },
  { pattern: '+', description: 'One or more (greedy)' },
  { pattern: '?', description: 'Zero or one (greedy)' },
  { pattern: '{n}', description: 'Exactly n times' },
  { pattern: '{n,}', description: 'n or more times' },
  { pattern: '{n,m}', description: 'Between n and m times' },
  { pattern: '*?', description: 'Zero or more (lazy)' },
  { pattern: '+?', description: 'One or more (lazy)' },
  { pattern: '??', description: 'Zero or one (lazy)' },
  { pattern: '{n,}?', description: 'n or more times (lazy)' },
  { pattern: '{n,m}?', description: 'Between n and m times (lazy)' },
  { pattern: '(...)', description: 'Capturing group' },
  { pattern: '(?:...)', description: 'Non-capturing group' },
  { pattern: '(?<name>...)', description: 'Named capturing group' },
  { pattern: '(?=...)', description: 'Positive lookahead' },
  { pattern: '(?!...)', description: 'Negative lookahead' },
  { pattern: '(?<=...)', description: 'Positive lookbehind' },
  { pattern: '(?<!...)', description: 'Negative lookbehind' },
  { pattern: '|', description: 'Alternation (OR)' },
  { pattern: '[...]', description: 'Character set' },
  { pattern: '[^...]', description: 'Negated character set' },
  { pattern: '[a-z]', description: 'Range (a through z)' },
]