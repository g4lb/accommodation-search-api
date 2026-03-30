import type { Request, Response } from 'express'
import type { SearchService } from '../services/searchService.js'
import { validateSearchBody } from '../validations/searchValidation.js'

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  async initiateSearch(req: Request, res: Response): Promise<void> {
    const validation = validateSearchBody(req.body)
    if (!validation.success) {
      res.status(400).json({ error: validation.error })
      return
    }

    const id = await this.searchService.initiateSearch(validation.data)
    res.json({ id })
  }

  async getSearch(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string
    const record = await this.searchService.getSearch(id)

    if (record === null) {
      res.status(404).json({ error: 'Search not found' })
      return
    }

    res.json(record)
  }
}
