export type CaseType =
  | 'uppercase'
  | 'lowercase'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'toggle'

export function convertCase(text: string, targetCase: CaseType): string {
  if (!text) return ''

  switch (targetCase) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'title':
      return text.replace(/\b\w/g, (c) => c.toUpperCase())
    case 'sentence':
      return text.replace(
        /(^\s*|[.!?]\s+)(\w)/g,
        (match, sep, char) => sep + char.toUpperCase()
      )
    case 'camel':
      return toCamelCase(text)
    case 'pascal': {
      const cc = toCamelCase(text)
      return cc.charAt(0).toUpperCase() + cc.slice(1)
    }
    case 'snake':
      return toWords(text).join('_').toLowerCase()
    case 'kebab':
      return toWords(text).join('-').toLowerCase()
    case 'constant':
      return toWords(text).join('_').toUpperCase()
    case 'dot':
      return toWords(text).join('.').toLowerCase()
    case 'path':
      return toWords(text).join('/').toLowerCase()
    case 'toggle':
      return toggleCase(text)
    default:
      return text
  }
}

function toCamelCase(text: string): string {
  const words = toWords(text)
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join('')
}

function toWords(text: string): string[] {
  const parts = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
  return parts.filter(Boolean)
}

function toggleCase(text: string): string {
  return text
    .split('')
    .map((c) =>
      c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
    )
    .join('')
}

export const CASE_TYPES: { label: string; value: CaseType }[] = [
  { label: 'UPPERCASE', value: 'uppercase' },
  { label: 'lowercase', value: 'lowercase' },
  { label: 'Title Case', value: 'title' },
  { label: 'Sentence case', value: 'sentence' },
  { label: 'camelCase', value: 'camel' },
  { label: 'PascalCase', value: 'pascal' },
  { label: 'snake_case', value: 'snake' },
  { label: 'kebab-case', value: 'kebab' },
  { label: 'CONSTANT_CASE', value: 'constant' },
  { label: 'dot.case', value: 'dot' },
  { label: 'path/case', value: 'path' },
  { label: 'Toggle Case', value: 'toggle' },
]
