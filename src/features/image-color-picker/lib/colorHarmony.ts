function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

export interface HarmonyColor {
  hex: string
  label: string
}

function rotateHue(h: number, degrees: number): number {
  return ((h + degrees) % 360 + 360) % 360
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

export function getComplementary(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 180), hsl.s, hsl.l), label: 'Complementary' },
  ]
}

export function getAnalogous(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex: hslToHex(rotateHue(hsl.h, -30), hsl.s, hsl.l), label: '-30°' },
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 30), hsl.s, hsl.l), label: '+30°' },
  ]
}

export function getTriadic(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 120), hsl.s, hsl.l), label: '+120°' },
    { hex: hslToHex(rotateHue(hsl.h, 240), hsl.s, hsl.l), label: '+240°' },
  ]
}

export function getSplitComplementary(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 150), hsl.s, hsl.l), label: '+150°' },
    { hex: hslToHex(rotateHue(hsl.h, 210), hsl.s, hsl.l), label: '+210°' },
  ]
}

export function getTetradic(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 90), hsl.s, hsl.l), label: '+90°' },
    { hex: hslToHex(rotateHue(hsl.h, 180), hsl.s, hsl.l), label: '+180°' },
    { hex: hslToHex(rotateHue(hsl.h, 270), hsl.s, hsl.l), label: '+270°' },
  ]
}

export function getSquare(hex: string): HarmonyColor[] {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { hex, label: 'Base' },
    { hex: hslToHex(rotateHue(hsl.h, 90), hsl.s, hsl.l), label: '+90°' },
    { hex: hslToHex(rotateHue(hsl.h, 180), hsl.s, hsl.l), label: '+180°' },
    { hex: hslToHex(rotateHue(hsl.h, 270), hsl.s, hsl.l), label: '+270°' },
  ]
}
