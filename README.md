# WeSki — Accommodation Search API

A stateless REST API for searching ski accommodation availability. Clients initiate a search and poll for results as they are retrieved from external providers.

## How it works

- `POST /search` — validates the request, returns a search ID immediately, and fans out to accommodation providers in the background
- `GET /search/:id` — returns accumulated results; poll until `status` is `"complete"`

Identical search parameters always return the same search ID — no duplicate provider calls are made. Multiple API instances can run in parallel, sharing state via Redis.

## Prerequisites

- Node.js 20+
- Docker (for Redis)

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

## Running

**Start Redis:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Development** (hot reload):
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server starts on port `3000` by default.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `MAX_GROUP_SIZE` | `6` | Maximum room capacity to search up to |
| `HOTELS_SIMULATOR_URL` | *(provider URL)* | External accommodation provider endpoint |

## API

### POST /search

Initiates a search. Returns immediately with a search ID.

**Request body:**
```json
{
  "ski_site": 4,
  "from_date": "03/04/2025",
  "to_date": "03/11/2025",
  "group_size": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ski_site` | number | Resort ID (1–5) |
| `from_date` | string | Start date in `MM/DD/YYYY` format |
| `to_date` | string | End date in `MM/DD/YYYY` format |
| `group_size` | number | Number of guests |

**Valid resort IDs:**

| ID | Resort |
|----|--------|
| 1 | Val Thorens |
| 2 | Courchevel |
| 3 | Tignes |
| 4 | La Plagne |
| 5 | Chamonix |

**Response:**
```json
{ "id": "a1b2c3d4-..." }
```

### GET /search/:id

Returns accumulated results for a search. Poll until `status === "complete"`.

**Response:**
```json
{
  "id": "a1b2c3d4-...",
  "status": "pending",
  "results": [
    {
      "hotelCode": "PWCSTANIN",
      "hotelName": "Chalet Nina",
      "mainImage": "https://...",
      "images": ["https://..."],
      "rating": 4,
      "beds": 3,
      "position": {
        "latitude": 45.2969,
        "longitude": 6.5757,
        "distances": [
          { "type": "ski_lift", "distance": "430m" },
          { "type": "city_center", "distance": "230m" }
        ]
      },
      "price": {
        "amountBeforeTax": 263.34,
        "amountAfterTax": 273.34
      }
    }
  ]
}
```

**Error responses:**

| Status | Meaning |
|--------|---------|
| `400` | Invalid or missing request fields |
| `404` | Search ID not found |
| `413` | Request body exceeds 4kb |
| `429` | Rate limit exceeded (60 requests/min) |
| `500` | Internal server error |
