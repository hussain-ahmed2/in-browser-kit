/**
 * Audio speed change utilities using FFmpeg's atempo filter.
 * atempo supports range 0.5 to 100.0, but for values outside 0.5-2.0
 * we chain multiple atempo filters.
 */

export function buildAtempoFilter(speed: number): string {
  // atempo range is 0.5 to 100.0, but quality degrades outside 0.5-2.0
  // For values outside 0.5-2.0, chain multiple atempo filters
  if (speed >= 0.5 && speed <= 2.0) {
    return `atempo=${speed}`
  }

  const filters: string[] = []
  let remaining = speed

  if (speed > 2.0) {
    while (remaining > 2.0) {
      filters.push('atempo=2.0')
      remaining /= 2.0
    }
    if (remaining > 1.0) {
      filters.push(`atempo=${remaining.toFixed(2)}`)
    }
  } else if (speed < 0.5) {
    while (remaining < 0.5) {
      filters.push('atempo=0.5')
      remaining /= 0.5
    }
    if (remaining < 1.0) {
      filters.push(`atempo=${remaining.toFixed(2)}`)
    }
  }

  return filters.join(',')
}

export function getSpeedArgs(
  speed: number,
  inputName: string,
  outputName: string
): string[] {
  const filter = buildAtempoFilter(speed)
  return [
    '-i', inputName,
    '-filter:a', filter,
    '-c:v', 'copy',
    outputName,
  ]
}
