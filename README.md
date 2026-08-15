# URL Shortener (Scalable)

A backend URL shortener built with Express 5, PostgreSQL, and Redis. Includes short link creation with optional expiry, click/stat tracking, cache-backed redirects, and per-route rate limiting. Fully containerized with Docker Compose.

## Features

- **Shorten & redirect** — generate a 6-character short code for any URL, with optional expiry (in seconds)
- **Redis-backed redirects** — cache-first lookups on redirect, falling back to Postgres on a miss
- **Click tracking** — per-code click counts and last-clicked timestamp, tracked in Redis
- **Cache metrics** — global cache hit/miss stats via `/stats/cache`
- **Rate limiting** — fixed-window rate limiting per IP, configurable per route
- **Dockerized** — app, Postgres, and Redis run via a single `docker compose up`

## Tech Stack

| Layer      | Tech                        |
|------------|------------------------------|
| Runtime    | Node.js 22, Express 5        |
| Database   | PostgreSQL                   |
| Cache      | Redis (redis-stack)          |
| Container  | Docker, Docker Compose        |

## Project Structure

```
.
├── docker/
│   └── init.sql
├── src/
│   ├── controllers/
│   │   └── urlController.js
│   ├── db/
│   │   └── postgres.js
│   ├── routes/
│   │   └── urlRoutes.js
│   ├── services/
│   │   ├── rateLimit.js
│   │   ├── redisService.js
│   │   └── urlService.js
│   ├── app.js
│   └── server.js
├── compose.yaml
├── Dockerfile
├── package.json
└── .env
```

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Setup

1. Clone the repo and add a `.env` file in the project root:

   ```env
   PORT=5000

   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   POSTGRES_DB=mydatabase

   REDIS_HOST=redis
   REDIS_PORT=6379
   ```

2. Start the stack:

   ```bash
   docker compose up --build
   ```

3. The app is available at `http://localhost:5000`.

### Running Locally (without Docker)

```bash
npm install
npm start
```

Make sure Postgres and Redis are running and reachable at the hosts/ports set in `.env`.

## API Reference

### Create a short URL

```
POST /urls
```

**Body**

```json
{
  "url": "https://example.com/some/very/long/path",
  "expiresIn": 3600
}
```

`expiresIn` is optional — pass `null` (or omit handling for it) for a link that never expires. Value is in seconds.

**Response** `201`

```json
{
  "originalUrl": "https://example.com/some/very/long/path",
  "shortCode": "aZ3kQ9",
  "expires_at": "2026-08-16T14:30:00.000Z"
}
```

### Redirect

```
GET /:code
```

Redirects to the original URL if it exists and hasn't expired. Returns `404` otherwise.

### Get stats for a short code

```
GET /stats/:code
```

**Response** `200`

```json
{
  "originalUrl": "https://example.com/some/very/long/path",
  "createdAt": "2026-08-16T13:30:00.000Z",
  "expiresAt": "2026-08-16T14:30:00.000Z",
  "clicks": "12",
  "lastClicked": "2026-08-16T14:12:03.512Z"
}
```

### Get global cache metrics

```
GET /stats/cache
```

**Response** `200`

```json
{
  "cacheHits": 142,
  "cacheMisses": 18,
  "hitRate": "88.75%"
}
```

## Rate Limits

| Route              | Limit             |
|---------------------|-------------------|
| `POST /urls`         | 10 requests / 60s |
| `GET /stats/:code`   | 30 requests / 60s |
| `GET /stats/cache`   | 10 requests / 60s |
| `GET /:code`         | 50 requests / 60s |

Limits are per IP, tracked in Redis with a fixed window. Exceeding the limit returns `429` with a `retryAfter` field (seconds).

## Environment Variables

| Variable            | Description                     |
|----------------------|----------------------------------|
| `PORT`               | Port the app listens on          |
| `POSTGRES_USER`      | Postgres username                |
| `POSTGRES_PASSWORD`  | Postgres password                |
| `POSTGRES_HOST`      | Postgres host                    |
| `POSTGRES_PORT`      | Postgres port                    |
| `POSTGRES_DB`        | Postgres database name           |
| `REDIS_HOST`         | Redis host                       |
| `REDIS_PORT`         | Redis port                       |

## Benchmarks

Load testing was performed using **autocannon** against the Redis-backed `GET /:code` redirect endpoint.

### Results

| Concurrent connections | RPS         | Avg Latency | p99 Latency |
| ---------------------- | ----------- | ----------- | ----------- |
| 500                    | 4,277 req/s | 116 ms      | 266 ms      |
| 1,000                  | 3,752 req/s | 264 ms      | 1,196 ms    |
| 2,000                  | 3,281 req/s | 631 ms      | 2,575 ms    |

The Redis hot-cache test maintained a **100% cache hit rate with 0 misses**.

As concurrency increased, requests per second started to drop while response times increased sharply.

> These benchmarks were run locally and should not be interpreted as production capacity.


## License

ISC
