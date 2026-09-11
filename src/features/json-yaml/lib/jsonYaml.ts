/**
 * JSON ↔ YAML converter — pure string operations, no external YAML library.
 * Uses a simple indent-based YAML serializer/deserializer.
 */

// ─── JSON → YAML ───────────────────────────────────────────────

function indent(level: number): string {
  return '  '.repeat(level)
}

function jsonValueToYaml(value: unknown, level: number): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    // Quote strings that need quoting
    if (
      value === '' ||
      value.includes(':') ||
      value.includes('#') ||
      value.includes('\n') ||
      value.startsWith(' ') ||
      value.endsWith(' ') ||
      /^[\d.e+-]+$/i.test(value) ||
      /^(true|false|null|yes|no)$/i.test(value)
    ) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')}"`
    }
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return value
      .map((item) => {
        const val = jsonValueToYaml(item, level + 1)
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          // Object in array — first property on same line as -
          const lines = val.split('\n').filter(l => l.trim())
          if (lines.length === 0) return `${indent(level)}- {}`
          const firstLine = lines[0].trimStart()
          const rest = lines.slice(1).map(l => `${indent(level)}  ${l.trimStart()}`).join('\n')
          return rest ? `${indent(level)}- ${firstLine}\n${rest}` : `${indent(level)}- ${firstLine}`
        }
        return `${indent(level)}- ${val.trim()}`
      })
      .join('\n')
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries
      .map(([key, val]) => {
        const yamlVal = jsonValueToYaml(val, level + 1)
        if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val as Record<string, unknown>).length > 0) {
          return `${indent(level)}${key}:\n${yamlVal}`
        }
        return `${indent(level)}${key}: ${yamlVal}`
      })
      .join('\n')
  }

  return String(value)
}

export function jsonToYaml(jsonStr: string): string {
  const parsed = JSON.parse(jsonStr)
  return jsonValueToYaml(parsed, 0)
}

// ─── YAML → JSON ───────────────────────────────────────────────

function parseYamlValue(value: string): unknown {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === '~') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10)
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
  // Quoted strings
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export function yamlToJson(yamlStr: string): string {
  const lines = yamlStr.split('\n')

  // Detect if this is a top-level list
  const firstNonEmptyLine = lines.find(l => l.trim() && !l.trim().startsWith('#'))
  const isTopLevelList = firstNonEmptyLine?.trimStart().startsWith('- ')

  if (isTopLevelList) {
    // Parse as top-level array
    const result: unknown[] = []
    const stack: { arr: unknown[]; indent: number }[] = [{ arr: result, indent: -1 }]

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue

      const match = line.match(/^(\s*)(- )?(.+?)(:\s*(.*))?$/)
      if (!match) continue

      const [, spaces, isListItem, key, , value] = match
      const currentIndent = spaces.length

      // Pop stack to find parent
      while (stack.length > 1 && stack[stack.length - 1].indent >= currentIndent) {
        stack.pop()
      }

      const parent = stack[stack.length - 1].arr

      if (isListItem) {
        const keyWithoutDash = key.trim()
        if (value && value.trim()) {
          // Simple value in array
          parent.push(parseYamlValue(value))
        } else if (keyWithoutDash.includes(':')) {
          // Inline key: value pair in array item
          const colonIdx = keyWithoutDash.indexOf(':')
          const inlineKey = keyWithoutDash.slice(0, colonIdx).trim()
          const inlineValue = keyWithoutDash.slice(colonIdx + 1).trim()
          const obj: Record<string, unknown> = {}
          obj[inlineKey] = parseYamlValue(inlineValue)
          parent.push(obj)
          stack.push({ arr: parent, indent: currentIndent + 2 })
        } else {
          // Nested object in array
          const newObj: Record<string, unknown> = {}
          parent.push(newObj)
          stack.push({ arr: parent, indent: currentIndent + 2 })
          // The key is actually a property of the new object
          if (keyWithoutDash) {
            newObj[keyWithoutDash] = value && value.trim() ? parseYamlValue(value) : {}
          }
        }
      } else if (value && value.trim()) {
        // Key-value pair (shouldn't happen at top level of array, but handle gracefully)
        const lastObj = parent[parent.length - 1] as Record<string, unknown>
        if (lastObj && typeof lastObj === 'object') {
          lastObj[key] = parseYamlValue(value)
        }
      }
    }

    return JSON.stringify(result, null, 2)
  }

  // Parse as object (original logic)
  const result: Record<string, unknown> = {}
  const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -1 }]

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue

    const match = line.match(/^(\s*)(- )?(.+?)(:\s*(.*))?$/)
    if (!match) continue

    const [, spaces, isList, key, , value] = match
    const currentIndent = spaces.length

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= currentIndent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].obj

    if (isList) {
      // Handle array items (simplified)
      const keyWithoutDash = key.trim()
      if (!Array.isArray(parent[keyWithoutDash])) {
        parent[keyWithoutDash] = []
      }
      const arr = parent[keyWithoutDash] as unknown[]
      if (value && value.trim()) {
        arr.push(parseYamlValue(value))
      } else {
        const newObj: Record<string, unknown> = {}
        arr.push(newObj)
        stack.push({ obj: newObj, indent: currentIndent + 2 })
      }
    } else if (value && value.trim()) {
      parent[key] = parseYamlValue(value)
    } else {
      // Nested object
      parent[key] = {}
      stack.push({ obj: parent[key] as Record<string, unknown>, indent: currentIndent })
    }
  }

  return JSON.stringify(result, null, 2)
}
