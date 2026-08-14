# URL Shortener API

A backend service for shortening URLs, built primarily to demonstrate a Redis caching layer in front of PostgreSQL for cutting down lookup latency on repeat requests.

## Overview

The service exposes two endpoints: one to create a short code for a URL, and one to redirect from a short code back to the original URL. The redirect path is where the caching lives, built around a cache-aside pattern with Redis sitting in front of Postgres.

## Why Redis is here

Every hit on a short link normally means a database lookup. But short links get repeated traffic, a link shared once gets clicked hundreds of times, all pointing at the same code and the same unchanged data. Most of those lookups don't need to touch the database at all.

Redis caches the result of a lookup for 1 hour after the first request. On a cache hit, the redirect is served straight from memory, no database round trip. On a miss, the app falls back to Postgres, then writes the result into Redis so the next request for that code is fast.

```
GET /:code
   |
   v
Check Redis --- hit ---> return cached URL, redirect
   |
  miss
   |
   v
Query Postgres --> cache result in Redis (TTL: 1hr) --> redirect
```

## Tech stack

- **Node.js / Express** — HTTP layer
- **PostgreSQL** — persistent storage for URL mappings
- **Redis** — caching layer for read-heavy lookups
- **Docker Compose** — runs Postgres and Redis locally

## API

### Create a short URL

```
POST /urls
Content-Type: application/json

{ "url": "https://example.com/some/very/long/path" }
```

Response:

```json
{
  "originalUrl": "https://example.com/some/very/long/path",
  "shortCode": "aZ3kD9"
}
```

### Redirect to the original URL

```
GET /:code
```

Redirects (302) to the original URL if the code exists, otherwise returns a 404.

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd <repo-folder>
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```
PORT=5000

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mydatabase

REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Start Postgres and Redis

```bash
docker compose up -d
```

This spins up Postgres (schema loaded from `docker/init.sql`) and Redis, both exposed on localhost.

### 4. Run the app

```bash
docker compose up --build
```

The API is available at `http://localhost:5000`.

## Notes

The focus of this project is the caching layer, not the URL shortener itself, so things like custom aliases, link expiration, and click analytics are intentionally left out for now.