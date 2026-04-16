export const config = {
  port: Number(process.env['PORT'] ?? 3000),
  redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  maxGroupSize: Number(process.env['MAX_GROUP_SIZE'] ?? 6),
  accommodationProviderUrl:
    process.env['ACCOMMODATION_PROVIDER_URL'] ??
    'https://api.accommodation-provider.example/search',
  bookingUrl: process.env['BOOKING_URL'] ?? 'https://api.booking.example/hotels',
}
