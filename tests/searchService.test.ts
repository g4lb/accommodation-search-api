import { describe, expect, it, vi } from 'vitest'
import type { Accommodation, AccommodationProvider, SearchParams } from '../src/providers/types.js'
import { SearchService } from '../src/services/searchService.js'
import type { ISearchStore } from '../src/store/ISearchStore.js'

const params: SearchParams = {
  location: 'Chamonix',
  from_date: '03/04/2025',
  to_date: '03/11/2025',
  group_size: 2,
}

const fakeAccommodation: Accommodation = {
  hotelCode: 'H1',
  hotelName: 'Test Hotel',
  mainImage: 'img.jpg',
  images: [],
  rating: 4,
  beds: 2,
  amenities: ['wifi'],
  position: { latitude: 0, longitude: 0, distances: [] },
  price: { amountBeforeTax: 100, amountAfterTax: 120 },
}

function createMockStore(overrides: Partial<ISearchStore> = {}): ISearchStore {
  return {
    acquireSlot: vi.fn().mockImplementation((id: string) => Promise.resolve(id)),
    create: vi.fn().mockResolvedValue(undefined),
    appendResults: vi.fn().mockResolvedValue(undefined),
    complete: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

function createMockProvider(results: Accommodation[] = []): AccommodationProvider {
  return {
    search: vi.fn().mockImplementation(async (_params, onResults) => {
      if (results.length > 0) await onResults(results)
    }),
  }
}

describe('SearchService', () => {
  describe('initiateSearch', () => {
    it('returns a new id when no duplicate exists', async () => {
      const store = createMockStore()
      const service = new SearchService(store, [])

      const id = await service.initiateSearch(params)

      expect(id).toMatch(/^[0-9a-f-]{36}$/)
      expect(store.acquireSlot).toHaveBeenCalledWith(id, params)
      expect(store.create).toHaveBeenCalledWith(id)
    })

    it('returns the existing id on duplicate', async () => {
      const store = createMockStore({
        acquireSlot: vi.fn().mockResolvedValue('existing-id'),
      })
      const service = new SearchService(store, [])

      const id = await service.initiateSearch(params)

      expect(id).toBe('existing-id')
      expect(store.create).not.toHaveBeenCalled()
    })

    it('calls providers in the background', async () => {
      const store = createMockStore()
      const provider = createMockProvider([fakeAccommodation])
      const service = new SearchService(store, [provider])

      await service.initiateSearch(params)

      // Give background runSearch a tick to execute
      await new Promise((r) => setTimeout(r, 10))

      expect(provider.search).toHaveBeenCalledWith(params, expect.any(Function))
      expect(store.appendResults).toHaveBeenCalled()
      expect(store.complete).toHaveBeenCalled()
    })

    it('completes even when a provider throws', async () => {
      const store = createMockStore()
      const failingProvider: AccommodationProvider = {
        search: vi.fn().mockRejectedValue(new Error('boom')),
      }
      const service = new SearchService(store, [failingProvider])

      await service.initiateSearch(params)
      await new Promise((r) => setTimeout(r, 10))

      expect(store.complete).toHaveBeenCalled()
    })
  })

  describe('getSearch', () => {
    it('returns null when not found', async () => {
      const store = createMockStore()
      const service = new SearchService(store, [])

      const result = await service.getSearch('nonexistent')
      expect(result).toBeNull()
    })

    it('returns the search record when found', async () => {
      const record = { id: 'abc', status: 'complete' as const, results: [fakeAccommodation] }
      const store = createMockStore({ get: vi.fn().mockResolvedValue(record) })
      const service = new SearchService(store, [])

      const result = await service.getSearch('abc')
      expect(result).toEqual(record)
    })
  })
})
