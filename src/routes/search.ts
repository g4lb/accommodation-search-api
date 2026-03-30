import { Router } from 'express'
import { SearchController } from '../controllers/searchController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import type { SearchService } from '../services/searchService.js'

export function createSearchRouter(searchService: SearchService): Router {
  const router = Router()
  const controller = new SearchController(searchService)

  router.post('/search', asyncHandler((req, res) => controller.initiateSearch(req, res)))
  router.get('/search/:id', asyncHandler((req, res) => controller.getSearch(req, res)))

  return router
}
