import { describe, expect, it } from 'vitest'
import {
  convertUnit,
  getCategoryUnits,
  getUnitNames,
  CATEGORIES,
  type UnitCategory
} from '../lib/unitConverter'

describe('Unit Converter', () => {
  describe('Length conversions', () => {
    it('converts meters to kilometers', () => {
      expect(convertUnit(1000, 'meter', 'kilometer', 'length')).toBe(1)
    })

    it('converts miles to kilometers', () => {
      expect(convertUnit(1, 'mile', 'kilometer', 'length')).toBeCloseTo(1.609344, 5)
    })

    it('converts feet to meters', () => {
      expect(convertUnit(3.28084, 'foot', 'meter', 'length')).toBeCloseTo(1, 4)
    })

    it('converts inches to centimeters', () => {
      expect(convertUnit(1, 'inch', 'centimeter', 'length')).toBeCloseTo(2.54, 4)
    })

    it('handles same unit conversion', () => {
      expect(convertUnit(5, 'meter', 'meter', 'length')).toBe(5)
    })
  })

  describe('Weight conversions', () => {
    it('converts kilograms to pounds', () => {
      expect(convertUnit(1, 'kilogram', 'pound', 'weight')).toBeCloseTo(2.20462, 4)
    })

    it('converts grams to ounces', () => {
      expect(convertUnit(28.3495, 'gram', 'ounce', 'weight')).toBeCloseTo(1, 4)
    })

    it('converts stones to kilograms', () => {
      expect(convertUnit(1, 'stone', 'kilogram', 'weight')).toBeCloseTo(6.35029, 4)
    })
  })

  describe('Temperature conversions', () => {
    it('converts Celsius to Fahrenheit', () => {
      expect(convertUnit(0, 'celsius', 'fahrenheit', 'temperature')).toBe(32)
      expect(convertUnit(100, 'celsius', 'fahrenheit', 'temperature')).toBe(212)
    })

    it('converts Fahrenheit to Celsius', () => {
      expect(convertUnit(32, 'fahrenheit', 'celsius', 'temperature')).toBe(0)
      expect(convertUnit(212, 'fahrenheit', 'celsius', 'temperature')).toBe(100)
    })

    it('converts Celsius to Kelvin', () => {
      expect(convertUnit(0, 'celsius', 'kelvin', 'temperature')).toBeCloseTo(273.15, 2)
      expect(convertUnit(100, 'celsius', 'kelvin', 'temperature')).toBeCloseTo(373.15, 2)
    })

    it('converts Kelvin to Fahrenheit', () => {
      expect(convertUnit(273.15, 'kelvin', 'fahrenheit', 'temperature')).toBeCloseTo(32, 2)
    })
  })

  describe('Data conversions', () => {
    it('converts bytes to kilobytes', () => {
      expect(convertUnit(1024, 'byte', 'kilobyte', 'data')).toBe(1)
    })

    it('converts megabytes to gigabytes', () => {
      expect(convertUnit(1024, 'megabyte', 'gigabyte', 'data')).toBe(1)
    })

    it('converts bits to bytes', () => {
      expect(convertUnit(8, 'bit', 'byte', 'data')).toBe(1)
    })
  })

  describe('Time conversions', () => {
    it('converts seconds to minutes', () => {
      expect(convertUnit(60, 'second', 'minute', 'time')).toBe(1)
    })

    it('converts hours to seconds', () => {
      expect(convertUnit(1, 'hour', 'second', 'time')).toBe(3600)
    })

    it('converts days to hours', () => {
      expect(convertUnit(1, 'day', 'hour', 'time')).toBe(24)
    })

    it('converts weeks to days', () => {
      expect(convertUnit(1, 'week', 'day', 'time')).toBe(7)
    })
  })

  describe('Area conversions', () => {
    it('converts square meters to square feet', () => {
      expect(convertUnit(1, 'squareMeter', 'squareFoot', 'area')).toBeCloseTo(10.7639, 3)
    })

    it('converts acres to hectares', () => {
      expect(convertUnit(1, 'acre', 'hectare', 'area')).toBeCloseTo(0.404686, 4)
    })

    it('converts square kilometers to acres', () => {
      expect(convertUnit(1, 'squareKilometer', 'acre', 'area')).toBeCloseTo(247.105, 2)
    })
  })

  describe('Volume conversions', () => {
    it('converts liters to gallons', () => {
      expect(convertUnit(1, 'liter', 'gallon', 'volume')).toBeCloseTo(0.264172, 4)
    })

    it('converts milliliters to teaspoons', () => {
      expect(convertUnit(5, 'milliliter', 'teaspoon', 'volume')).toBeCloseTo(1.01442, 3)
    })

    it('converts cups to milliliters', () => {
      expect(convertUnit(1, 'cup', 'milliliter', 'volume')).toBeCloseTo(236.588, 2)
    })
  })

  describe('Speed conversions', () => {
    it('converts m/s to km/h', () => {
      expect(convertUnit(1, 'meterPerSecond', 'kilometerPerHour', 'speed')).toBe(3.6)
    })

    it('converts mph to km/h', () => {
      expect(convertUnit(60, 'milePerHour', 'kilometerPerHour', 'speed')).toBeCloseTo(96.5606, 3)
    })

    it('converts knots to m/s', () => {
      expect(convertUnit(1, 'knot', 'meterPerSecond', 'speed')).toBeCloseTo(0.514444, 4)
    })
  })

  describe('Edge cases', () => {
    it('returns NaN for invalid category', () => {
      expect(convertUnit(1, 'meter', 'foot', 'invalid' as UnitCategory)).toBeNaN()
    })

    it('returns NaN for invalid from unit', () => {
      expect(convertUnit(1, 'invalid', 'meter', 'length')).toBeNaN()
    })

    it('returns NaN for invalid to unit', () => {
      expect(convertUnit(1, 'meter', 'invalid', 'length')).toBeNaN()
    })

    it('handles zero', () => {
      expect(convertUnit(0, 'meter', 'kilometer', 'length')).toBe(0)
    })

    it('handles negative values', () => {
      expect(convertUnit(-10, 'celsius', 'fahrenheit', 'temperature')).toBe(14)
    })

    it('handles very small values', () => {
      expect(convertUnit(1e-10, 'meter', 'nanometer', 'length')).toBeCloseTo(0.1, 10)
    })
  })

  describe('getCategoryUnits', () => {
    it('returns all units for length', () => {
      const units = getCategoryUnits('length')
      expect(units).toContain('meter')
      expect(units).toContain('kilometer')
      expect(units).toContain('mile')
    })

    it('returns all units for temperature', () => {
      const units = getCategoryUnits('temperature')
      expect(units).toContain('celsius')
      expect(units).toContain('fahrenheit')
      expect(units).toContain('kelvin')
    })
  })

  describe('getUnitNames', () => {
    it('returns formatted names with symbols', () => {
      const names = getUnitNames('length')
      expect(names.meter).toBe('Meter (m)')
      expect(names.kilometer).toBe('Kilometer (km)')
      expect(names.mile).toBe('Mile (mi)')
    })
  })

  describe('CATEGORIES structure', () => {
    it('has all 8 categories', () => {
      expect(Object.keys(CATEGORIES)).toHaveLength(8)
    })

    it('each category has name, units, baseUnit', () => {
      for (const [, cat] of Object.entries(CATEGORIES)) {
        expect(cat).toHaveProperty('name')
        expect(cat).toHaveProperty('units')
        expect(cat).toHaveProperty('baseUnit')
        expect(Object.keys(cat.units).length).toBeGreaterThan(0)
      }
    })
  })
})