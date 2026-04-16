import { z } from 'zod'
import { ErrorMessage } from '../constants/index.js'
import type { SearchParams } from '../providers/types.js'

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/

function isValidDate(value: string): boolean {
  const [mm, dd, yyyy] = value.split('/') as [string, string, string]
  const month = Number(mm)
  const day = Number(dd)
  const year = Number(yyyy)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

const searchSchema = z
  .object({
    location: z
      .string({
        required_error: ErrorMessage.LocationRequired,
        invalid_type_error: ErrorMessage.LocationMustBeString,
      })
      .min(1, ErrorMessage.LocationRequired),
    from_date: z
      .string({ required_error: ErrorMessage.FromDateRequired })
      .min(1, ErrorMessage.FromDateRequired)
      .regex(DATE_REGEX, ErrorMessage.FromDateInvalid)
      .refine(isValidDate, { message: ErrorMessage.FromDateInvalid }),
    to_date: z
      .string({ required_error: ErrorMessage.ToDateRequired })
      .min(1, ErrorMessage.ToDateRequired)
      .regex(DATE_REGEX, ErrorMessage.ToDateInvalid)
      .refine(isValidDate, { message: ErrorMessage.ToDateInvalid }),
    group_size: z
      .number({
        required_error: ErrorMessage.GroupSizeRequired,
        invalid_type_error: ErrorMessage.GroupSizeMustBeNumber,
      })
      .int()
      .positive(ErrorMessage.GroupSizeMustBePositive),
    price_min: z.number({ invalid_type_error: ErrorMessage.PriceMinMustBeNumber }).nonnegative(ErrorMessage.PriceMinMustBeNumber).optional(),
    price_max: z.number({ invalid_type_error: ErrorMessage.PriceMaxMustBeNumber }).nonnegative(ErrorMessage.PriceMaxMustBeNumber).optional(),
    amenities: z.array(z.string(), { invalid_type_error: ErrorMessage.AmenitiesMustBeArray }).optional(),
  })
  .refine(
    (data) => {
      if (data.price_min !== undefined && data.price_max !== undefined) {
        return data.price_min <= data.price_max
      }
      return true
    },
    { message: ErrorMessage.PriceRangeInvalid, path: ['price_min'] },
  )

export type SearchValidationResult =
  | { success: true; data: SearchParams }
  | { success: false; error: string }

export function validateSearchBody(body: unknown): SearchValidationResult {
  const result = searchSchema.safeParse(body)
  if (!result.success) {
    const error = result.error.errors[0]?.message ?? ErrorMessage.InvalidRequestBody
    return { success: false, error }
  }
  return { success: true, data: result.data }
}
