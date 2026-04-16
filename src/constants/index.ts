export enum HttpStatus {
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500,
}

export enum ErrorMessage {
  SearchNotFound = 'Search not found',
  InternalServerError = 'Internal server error',
  InvalidRequestBody = 'Invalid request body',
  LocationRequired = 'location is required',
  LocationMustBeString = 'location must be a non-empty string',
  FromDateRequired = 'from_date is required',
  FromDateInvalid = 'from_date must be in MM/DD/YYYY format',
  ToDateRequired = 'to_date is required',
  ToDateInvalid = 'to_date must be in MM/DD/YYYY format',
  GroupSizeMustBeNumber = 'group_size must be a number',
  GroupSizeRequired = 'group_size is required',
  GroupSizeMustBePositive = 'group_size must be a positive integer',
  PriceMinMustBeNumber = 'price_min must be a non-negative number',
  PriceMaxMustBeNumber = 'price_max must be a non-negative number',
  PriceRangeInvalid = 'price_min must be less than or equal to price_max',
  AmenitiesMustBeArray = 'amenities must be an array of strings',
}
