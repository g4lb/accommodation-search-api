import { afterEach, describe, expect, it, vi } from 'vitest'
import { BookingProvider } from '../src/providers/bookingProvider.js'
import type { Accommodation, SearchParams } from '../src/providers/types.js'

const params: SearchParams = {
  location: 'Chamonix',
  from_date: '03/04/2025',
  to_date: '03/11/2025',
  group_size: 2,
}

const bookingHotel = {
  id: 'B1',
  name: 'Booking Hotel',
  photo_url: 'photo.jpg',
  star_rating: 3,
  bed_count: 2,
  lat: 45.9,
  lng: 6.8,
  price_total: 300,
  price_net: 250,
  amenities: ['parking', 'gym'],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BookingProvider', () => {
  it('normalizes booking response to Accommodation', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ hotels: [bookingHotel] }),
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const provider = new BookingProvider('http://test')
    const results: Accommodation[] = []
    await provider.search(params, async (r) => { results.push(...r) })

    expect(results).toHaveLength(1)
    const acc = results[0]!
    expect(acc.hotelCode).toBe('B1')
    expect(acc.hotelName).toBe('Booking Hotel')
    expect(acc.mainImage).toBe('photo.jpg')
    expect(acc.rating).toBe(3)
    expect(acc.beds).toBe(2)
    expect(acc.amenities).toEqual(['parking', 'gym'])
    expect(acc.position.latitude).toBe(45.9)
    expect(acc.price.amountBeforeTax).toBe(250)
    expect(acc.price.amountAfterTax).toBe(300)
  })

  it('passes location and optional filters as query params', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ hotels: [] }),
    }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const provider = new BookingProvider('http://test')
    const fullParams: SearchParams = { ...params, price_min: 100, price_max: 500, amenities: ['wifi'] }
    await provider.search(fullParams, async () => {})

    const url = new URL(fetchSpy.mock.calls[0]![0] as string)
    expect(url.searchParams.get('location')).toBe('Chamonix')
    expect(url.searchParams.get('price_min')).toBe('100')
    expect(url.searchParams.get('price_max')).toBe('500')
    expect(url.searchParams.get('amenities')).toBe('wifi')
  })

  it('omits optional params when not provided', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ hotels: [] }),
    }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const provider = new BookingProvider('http://test')
    await provider.search(params, async () => {})

    const url = new URL(fetchSpy.mock.calls[0]![0] as string)
    expect(url.searchParams.has('price_min')).toBe(false)
    expect(url.searchParams.has('price_max')).toBe(false)
    expect(url.searchParams.has('amenities')).toBe(false)
  })

  it('defaults amenities to empty array when not present', async () => {
    const { amenities: _, ...hotelNoAmenities } = bookingHotel
    const mockResponse = {
      ok: true,
      json: async () => ({ hotels: [hotelNoAmenities] }),
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response)

    const provider = new BookingProvider('http://test')
    const results: Accommodation[] = []
    await provider.search(params, async (r) => { results.push(...r) })

    expect(results[0]!.amenities).toEqual([])
  })
})
