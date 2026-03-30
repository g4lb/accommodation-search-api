export interface SearchParams {
  ski_site: number
  from_date: string
  to_date: string
  group_size: number
}

export interface AccommodationDistance {
  type: string
  distance: string
}

export interface AccommodationPosition {
  latitude: number
  longitude: number
  distances: AccommodationDistance[]
}

export interface AccommodationPrice {
  amountBeforeTax: number
  amountAfterTax: number
}

export interface Accommodation {
  hotelCode: string
  hotelName: string
  mainImage: string
  images: string[]
  rating: number
  beds: number
  position: AccommodationPosition
  price: AccommodationPrice
}

export type OnResults = (results: Accommodation[]) => Promise<void>

export interface AccommodationProvider {
  search(params: SearchParams, onResults: OnResults): Promise<void>
}

export type SearchStatus = 'pending' | 'complete'

export interface SearchRecord {
  id: string
  status: SearchStatus
  results: Accommodation[]
}
