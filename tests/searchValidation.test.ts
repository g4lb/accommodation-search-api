import { describe, expect, it } from 'vitest'
import { ErrorMessage } from '../src/constants/index.js'
import { validateSearchBody } from '../src/validations/searchValidation.js'

const validBody = {
  location: 'Chamonix',
  from_date: '03/04/2025',
  to_date: '03/11/2025',
  group_size: 2,
}

describe('validateSearchBody', () => {
  it('accepts a valid body with required fields only', () => {
    const result = validateSearchBody(validBody)
    expect(result).toEqual({ success: true, data: validBody })
  })

  it('accepts a body with all optional fields', () => {
    const body = { ...validBody, price_min: 100, price_max: 500, amenities: ['wifi', 'pool'] }
    const result = validateSearchBody(body)
    expect(result).toEqual({ success: true, data: body })
  })

  describe('location', () => {
    it('rejects missing location', () => {
      const { location: _, ...body } = validBody
      const result = validateSearchBody(body)
      expect(result).toEqual({ success: false, error: ErrorMessage.LocationRequired })
    })

    it('rejects empty string location', () => {
      const result = validateSearchBody({ ...validBody, location: '' })
      expect(result).toEqual({ success: false, error: ErrorMessage.LocationRequired })
    })

    it('rejects non-string location', () => {
      const result = validateSearchBody({ ...validBody, location: 123 })
      expect(result).toEqual({ success: false, error: ErrorMessage.LocationMustBeString })
    })
  })

  describe('from_date', () => {
    it('rejects missing from_date', () => {
      const { from_date: _, ...body } = validBody
      const result = validateSearchBody(body)
      expect(result).toEqual({ success: false, error: ErrorMessage.FromDateRequired })
    })

    it('rejects invalid format', () => {
      const result = validateSearchBody({ ...validBody, from_date: '2025-03-04' })
      expect(result).toEqual({ success: false, error: ErrorMessage.FromDateInvalid })
    })

    it('rejects impossible date', () => {
      const result = validateSearchBody({ ...validBody, from_date: '02/30/2025' })
      expect(result).toEqual({ success: false, error: ErrorMessage.FromDateInvalid })
    })
  })

  describe('to_date', () => {
    it('rejects missing to_date', () => {
      const { to_date: _, ...body } = validBody
      const result = validateSearchBody(body)
      expect(result).toEqual({ success: false, error: ErrorMessage.ToDateRequired })
    })

    it('rejects invalid format', () => {
      const result = validateSearchBody({ ...validBody, to_date: '2025-03-11' })
      expect(result).toEqual({ success: false, error: ErrorMessage.ToDateInvalid })
    })
  })

  describe('group_size', () => {
    it('rejects missing group_size', () => {
      const { group_size: _, ...body } = validBody
      const result = validateSearchBody(body)
      expect(result).toEqual({ success: false, error: ErrorMessage.GroupSizeRequired })
    })

    it('rejects non-number', () => {
      const result = validateSearchBody({ ...validBody, group_size: 'two' })
      expect(result).toEqual({ success: false, error: ErrorMessage.GroupSizeMustBeNumber })
    })

    it('rejects zero', () => {
      const result = validateSearchBody({ ...validBody, group_size: 0 })
      expect(result).toEqual({ success: false, error: ErrorMessage.GroupSizeMustBePositive })
    })

    it('rejects negative', () => {
      const result = validateSearchBody({ ...validBody, group_size: -1 })
      expect(result).toEqual({ success: false, error: ErrorMessage.GroupSizeMustBePositive })
    })
  })

  describe('price_min / price_max', () => {
    it('accepts price_min only', () => {
      const result = validateSearchBody({ ...validBody, price_min: 50 })
      expect(result.success).toBe(true)
    })

    it('accepts price_max only', () => {
      const result = validateSearchBody({ ...validBody, price_max: 300 })
      expect(result.success).toBe(true)
    })

    it('rejects negative price_min', () => {
      const result = validateSearchBody({ ...validBody, price_min: -10 })
      expect(result).toEqual({ success: false, error: ErrorMessage.PriceMinMustBeNumber })
    })

    it('rejects negative price_max', () => {
      const result = validateSearchBody({ ...validBody, price_max: -5 })
      expect(result).toEqual({ success: false, error: ErrorMessage.PriceMaxMustBeNumber })
    })

    it('rejects non-number price_min', () => {
      const result = validateSearchBody({ ...validBody, price_min: 'cheap' })
      expect(result).toEqual({ success: false, error: ErrorMessage.PriceMinMustBeNumber })
    })

    it('rejects price_min > price_max', () => {
      const result = validateSearchBody({ ...validBody, price_min: 500, price_max: 100 })
      expect(result).toEqual({ success: false, error: ErrorMessage.PriceRangeInvalid })
    })

    it('accepts price_min === price_max', () => {
      const result = validateSearchBody({ ...validBody, price_min: 200, price_max: 200 })
      expect(result.success).toBe(true)
    })
  })

  describe('amenities', () => {
    it('accepts empty array', () => {
      const result = validateSearchBody({ ...validBody, amenities: [] })
      expect(result.success).toBe(true)
    })

    it('rejects non-array', () => {
      const result = validateSearchBody({ ...validBody, amenities: 'wifi' })
      expect(result).toEqual({ success: false, error: ErrorMessage.AmenitiesMustBeArray })
    })
  })
})
