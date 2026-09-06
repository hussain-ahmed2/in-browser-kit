/**
 * CSS Gradient Generator — builds CSS gradient strings from inputs.
 */

export function generateLinearGradient(colors: string[], angle: number): string {
  if (colors.length === 0) return ''
  if (colors.length === 1) return `linear-gradient(${angle}deg, ${colors[0]})`
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`
}

export function generateRadialGradient(colors: string[]): string {
  if (colors.length === 0) return ''
  if (colors.length === 1) return `radial-gradient(circle, ${colors[0]})`
  return `radial-gradient(circle, ${colors.join(', ')})`
}

export function generateGradient(
  type: 'linear' | 'radial',
  colors: string[],
  angle: number
): string {
  return type === 'linear'
    ? generateLinearGradient(colors, angle)
    : generateRadialGradient(colors)
}

export function generateCssBlock(
  type: 'linear' | 'radial',
  colors: string[],
  angle: number
): string {
  const gradient = generateGradient(type, colors, angle)
  return `background: ${gradient};`
}
