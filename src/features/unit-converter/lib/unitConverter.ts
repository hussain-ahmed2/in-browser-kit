export type UnitCategory = 'length' | 'weight' | 'temperature' | 'data' | 'time' | 'area' | 'volume' | 'speed'

export interface Unit {
  name: string
  symbol: string
  toBase: (value: number) => number
  fromBase: (value: number) => number
}

export interface CategoryDefinition {
  name: string
  units: Record<string, Unit>
  baseUnit: string
}

const LENGTH_UNITS: Record<string, Unit> = {
  nanometer: { name: 'Nanometer', symbol: 'nm', toBase: (v) => v / 1_000_000_000, fromBase: (v) => v * 1_000_000_000 },
  micrometer: { name: 'Micrometer', symbol: 'µm', toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
  millimeter: { name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  centimeter: { name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  meter: { name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
  kilometer: { name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  inch: { name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  foot: { name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  yard: { name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
  mile: { name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
}

const WEIGHT_UNITS: Record<string, Unit> = {
  milligram: { name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
  gram: { name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  kilogram: { name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
  metricTon: { name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ounce: { name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
  pound: { name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  stone: { name: 'Stone', symbol: 'st', toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
}

const TEMPERATURE_UNITS: Record<string, Unit> = {
  celsius: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
  fahrenheit: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
  kelvin: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
}

const DATA_UNITS: Record<string, Unit> = {
  bit: { name: 'Bit', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
  byte: { name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
  kilobyte: { name: 'Kilobyte', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
  megabyte: { name: 'Megabyte', symbol: 'MB', toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024) },
  gigabyte: { name: 'Gigabyte', symbol: 'GB', toBase: (v) => v * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024) },
  terabyte: { name: 'Terabyte', symbol: 'TB', toBase: (v) => v * 1024 * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024 * 1024) },
}

const TIME_UNITS: Record<string, Unit> = {
  nanosecond: { name: 'Nanosecond', symbol: 'ns', toBase: (v) => v / 1_000_000_000, fromBase: (v) => v * 1_000_000_000 },
  microsecond: { name: 'Microsecond', symbol: 'µs', toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
  millisecond: { name: 'Millisecond', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  second: { name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
  minute: { name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  hour: { name: 'Hour', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  day: { name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
  week: { name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
}

const AREA_UNITS: Record<string, Unit> = {
  squareMillimeter: { name: 'Square Millimeter', symbol: 'mm²', toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
  squareCentimeter: { name: 'Square Centimeter', symbol: 'cm²', toBase: (v) => v / 10_000, fromBase: (v) => v * 10_000 },
  squareMeter: { name: 'Square Meter', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
  squareKilometer: { name: 'Square Kilometer', symbol: 'km²', toBase: (v) => v * 1_000_000, fromBase: (v) => v / 1_000_000 },
  squareInch: { name: 'Square Inch', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
  squareFoot: { name: 'Square Foot', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
  squareYard: { name: 'Square Yard', symbol: 'yd²', toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
  acre: { name: 'Acre', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
  hectare: { name: 'Hectare', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
}

const VOLUME_UNITS: Record<string, Unit> = {
  milliliter: { name: 'Milliliter', symbol: 'ml', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  liter: { name: 'Liter', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
  cubicMeter: { name: 'Cubic Meter', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  cubicCentimeter: { name: 'Cubic Centimeter', symbol: 'cm³', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  teaspoon: { name: 'Teaspoon', symbol: 'tsp', toBase: (v) => v * 4.92892 / 1000, fromBase: (v) => v / (4.92892 / 1000) },
  tablespoon: { name: 'Tablespoon', symbol: 'tbsp', toBase: (v) => v * 14.7868 / 1000, fromBase: (v) => v / (14.7868 / 1000) },
  fluidOunce: { name: 'Fluid Ounce', symbol: 'fl oz', toBase: (v) => v * 29.5735 / 1000, fromBase: (v) => v / (29.5735 / 1000) },
  cup: { name: 'Cup', symbol: 'cup', toBase: (v) => v * 236.588 / 1000, fromBase: (v) => v / (236.588 / 1000) },
  pint: { name: 'Pint', symbol: 'pt', toBase: (v) => v * 473.176 / 1000, fromBase: (v) => v / (473.176 / 1000) },
  quart: { name: 'Quart', symbol: 'qt', toBase: (v) => v * 946.353 / 1000, fromBase: (v) => v / (946.353 / 1000) },
  gallon: { name: 'Gallon', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
}

const SPEED_UNITS: Record<string, Unit> = {
  meterPerSecond: { name: 'Meter/Second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
  kilometerPerHour: { name: 'Kilometer/Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  milePerHour: { name: 'Mile/Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  footPerSecond: { name: 'Foot/Second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  knot: { name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
}

export const CATEGORIES: Record<UnitCategory, CategoryDefinition> = {
  length: { name: 'Length', units: LENGTH_UNITS, baseUnit: 'meter' },
  weight: { name: 'Weight / Mass', units: WEIGHT_UNITS, baseUnit: 'kilogram' },
  temperature: { name: 'Temperature', units: TEMPERATURE_UNITS, baseUnit: 'celsius' },
  data: { name: 'Data', units: DATA_UNITS, baseUnit: 'byte' },
  time: { name: 'Time', units: TIME_UNITS, baseUnit: 'second' },
  area: { name: 'Area', units: AREA_UNITS, baseUnit: 'squareMeter' },
  volume: { name: 'Volume', units: VOLUME_UNITS, baseUnit: 'liter' },
  speed: { name: 'Speed', units: SPEED_UNITS, baseUnit: 'meterPerSecond' },
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number {
  const cat = CATEGORIES[category]
  if (!cat) return NaN
  
  const from = cat.units[fromUnit]
  const to = cat.units[toUnit]
  
  if (!from || !to) return NaN
  
  if (category === 'temperature') {
    return to.fromBase(from.toBase(value))
  }
  
  const baseValue = from.toBase(value)
  return to.fromBase(baseValue)
}

export function getCategoryUnits(category: UnitCategory): string[] {
  return Object.keys(CATEGORIES[category].units)
}

export function getUnitNames(category: UnitCategory): Record<string, string> {
  const cat = CATEGORIES[category]
  const result: Record<string, string> = {}
  for (const [key, unit] of Object.entries(cat.units)) {
    result[key] = `${unit.name} (${unit.symbol})`
  }
  return result
}