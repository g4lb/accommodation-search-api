import { z } from 'zod'
import { validResortIds } from '../data/resorts.js'
import type { SearchParams } from '../providers/types.js'

const searchSchema = z.object({
  ski_site: z
    .number({ invalid_type_error: 'ski_site must be a number' })
    .int()
    .refine((id) => validResortIds.has(id), { message: 'ski_site is not a valid resort ID' }),
  from_date: z.string().min(1, 'from_date is required'),
  to_date: z.string().min(1, 'to_date is required'),
  group_size: z
    .number({ invalid_type_error: 'group_size must be a number' })
    .int()
    .positive('group_size must be a positive integer'),
})

export type SearchValidationResult =
  | { success: true; data: SearchParams }
  | { success: false; error: string }

export function validateSearchBody(body: unknown): SearchValidationResult {
  const result = searchSchema.safeParse(body)
  if (!result.success) {
    const error = result.error.errors[0]?.message ?? 'Invalid request body'
    return { success: false, error }
  }
  return { success: true, data: result.data }
}
