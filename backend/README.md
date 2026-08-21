# MTA Alerts Proxy (Cloudflare Worker)

A tiny Cloudflare Worker that fetches MTA's GTFS-realtime protobuf feeds,
decodes them, and returns clean JSON with CORS enabled — so your app (web
or mobile) never has to touch protobuf or worry about CORS/rehosting rules.

## Setup

```bash
cd mta-alerts-worker
npm install
```

## Local testing

```bash
npm run dev
```

This starts a local dev server (usually `http://localhost:8787`). Try:

```bash
curl http://localhost:8787/                     # subway alerts (default)
curl http://localhost:8787/?feed=lirr-alerts     # LIRR alerts
curl http://localhost:8787/?feed=list            # see all available feeds
```

## Deploy

```bash
npx wrangler login   # one-time, opens a browser to authorize
npm run deploy
```

Wrangler will print your live URL, something like:

```
https://mta-alerts-proxy.<your-subdomain>.workers.dev
```

That's the URL your React app or mobile app should call — e.g.
`https://mta-alerts-proxy.<your-subdomain>.workers.dev/?feed=subway-alerts`.

## Response shape

```json
{
  "feed": "subway-alerts",
  "fetchedAt": "2026-08-18T12:34:56.000Z",
  "count": 3,
  "alerts": [
    {
      "id": "some-alert-id",
      "routeIds": ["A", "C"],
      "header": "Service change on A C lines",
      "description": "Because of ...",
      "activePeriods": [{ "start": 1755500000000, "end": null }]
    }
  ]
}
```

`activePeriods` timestamps are in milliseconds since epoch (ready to pass
straight into `new Date(...)` in JS/Swift/Kotlin).

## Notes

- **Caching:** responses are cached at Cloudflare's edge for 30 seconds
  (`CACHE_TTL_SECONDS` in `src/index.js`) so bursts of requests from your
  users don't each hit MTA. Raise this if you don't need near-real-time data.
- **CORS:** currently wide open (`*`). If this worker only ever serves your
  own app, you can lock `Access-Control-Allow-Origin` down to your app's
  domain/scheme in `src/index.js`.
- **Feeds:** subway, LIRR, Metro-North, and bus alert feeds are pre-wired in
  the `FEEDS` object. Add trip-update or vehicle-position feeds the same way
  if you need those too — just add the URL and adjust the decode logic if
  the shape differs.
- **Cost:** Cloudflare's free tier (100k requests/day) is almost certainly
  enough for a personal or small-scale app.
