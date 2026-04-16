import express from 'express'
import supertest from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { ErrorMessage } from '../src/constants/index.js'
import type { SearchService } from '../src/services/searchService.js'
import { createSearchRouter } from '../src/routes/search.js'

const validBody = {
  location: 'Chamonix',
  from_date: '03/04/2025',
  to_date: '03/11/2025',
  group_size: 2,
}

function createApp(service: SearchService) {
  const app = express()
  app.use(express.json())
  app.use(createSearchRouter(service))
  return app
}

function createMockService(overrides: Partial<SearchService> = {}) {
  return {
    initiateSearch: vi.fn().mockResolvedValue('test-uuid'),
    getSearch: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as SearchService
}

function post(app: express.Application, body: unknown) {
  return supertest(app).post('/search').send(body)
}

function get(app: express.Application, id: string) {
  return supertest(app).get(`/search/${id}`)
}

describe('POST /search', () => {
  it('returns 200 with id for valid body', async () => {
    const service = createMockService()
    const app = createApp(service)

    const res = await post(app, validBody)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 'test-uuid' })
    expect(service.initiateSearch).toHaveBeenCalledWith(validBody)
  })

  it('returns 400 for missing location', async () => {
    const service = createMockService()
    const app = createApp(service)
    const { location: _, ...body } = validBody

    const res = await post(app, body)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: ErrorMessage.LocationRequired })
  })

  it('returns 400 for invalid date', async () => {
    const service = createMockService()
    const app = createApp(service)

    const res = await post(app, { ...validBody, from_date: 'bad' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: ErrorMessage.FromDateInvalid })
  })

  it('returns 400 for price_min > price_max', async () => {
    const service = createMockService()
    const app = createApp(service)

    const res = await post(app, { ...validBody, price_min: 500, price_max: 100 })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: ErrorMessage.PriceRangeInvalid })
  })
})

describe('GET /search/:id', () => {
  it('returns 404 when search not found', async () => {
    const service = createMockService()
    const app = createApp(service)

    const res = await get(app, 'nonexistent')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: ErrorMessage.SearchNotFound })
  })

  it('returns the search record when found', async () => {
    const record = { id: 'abc', status: 'complete', results: [] }
    const service = createMockService({ getSearch: vi.fn().mockResolvedValue(record) } as Partial<SearchService>)
    const app = createApp(service)

    const res = await get(app, 'abc')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(record)
  })
})
