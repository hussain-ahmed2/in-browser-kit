export interface PaletteColor {
  hex: string
  label?: string
}

export function toCssVars(colors: PaletteColor[], prefix = 'color'): string {
  const lines = colors.map((c, i) => {
    const name = c.label
      ? c.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : `${prefix}-${i + 1}`
    return `  --${name}: ${c.hex};`
  })
  return `:root {\n${lines.join('\n')}\n}`
}

export function toScssVars(colors: PaletteColor[], prefix = 'color'): string {
  return colors
    .map((c, i) => {
      const name = c.label
        ? c.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : `${prefix}-${i + 1}`
      return `$${name}: ${c.hex};`
    })
    .join('\n')
}

export function toJson(colors: PaletteColor[]): string {
  const obj = colors.map((c) => ({
    hex: c.hex,
    label: c.label ?? null,
  }))
  return JSON.stringify({ colors: obj }, null, 2)
}
