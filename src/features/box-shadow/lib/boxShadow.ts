/**
 * CSS Box Shadow Generator — builds box-shadow strings from inputs.
 */

export function generateBoxShadow(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
  inset: boolean
): string {
  const insetStr = inset ? 'inset ' : ''
  return `${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`
}

export function generateCssBlock(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
  inset: boolean
): string {
  const shadow = generateBoxShadow(offsetX, offsetY, blur, spread, color, inset)
  return `box-shadow: ${shadow};`
}
