import express, { type NextFunction, type Request, type Response } from 'express'
import { createSearchRouter } from './routes/search.js'
import type { SearchService } from './services/searchService.js'

export function createApp(searchService: SearchService): express.Application {
  const app = express()

  app.use(express.json())
  app.use(createSearchRouter(searchService))

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
