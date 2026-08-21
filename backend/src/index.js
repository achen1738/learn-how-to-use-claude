import GtfsRealtimeBindings from "gtfs-realtime-bindings";

// MTA GTFS-RT feed endpoints (no API key required as of 2026).
// Add/remove feeds here as needed — see https://api.mta.info for the full list.
// NOTE: the slash inside "camsys/..." must be percent-encoded (%2F) — MTA's
// API Gateway treats it as part of the resource name, not a path separator.
// An unencoded slash 404s as a generic (and misleading) 403 "Missing
// Authentication Token" error.
const FEEDS = {
  "subway-alerts": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts",
  "subway-service-alerts": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts",
  "lirr-alerts": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Flirr-alerts",
  "mnr-alerts": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fmnr-alerts",
  "bus-alerts": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fbus-alerts",
};

// Cache decoded JSON for this many seconds to avoid hammering MTA's servers.
const CACHE_TTL_SECONDS = 30;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // tighten this to your app's origin/scheme if you want
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      ...CORS_HEADERS,
    },
  });
}

// Turns a decoded GTFS-RT FeedMessage into a simpler, app-friendly shape.
function simplifyAlerts(feed) {
  const alerts = [];

  for (const entity of feed.entity) {
    if (!entity.alert) continue;
    const alert = entity.alert;

    const routeIds = (alert.informedEntity || [])
      .map((e) => e.routeId)
      .filter(Boolean);

    const header = alert.headerText?.translation?.[0]?.text ?? null;
    const description = alert.descriptionText?.translation?.[0]?.text ?? null;

    const activePeriods = (alert.activePeriod || []).map((p) => ({
      start: p.start ? Number(p.start) * 1000 : null, // ms since epoch
      end: p.end ? Number(p.end) * 1000 : null,
    }));

    alerts.push({
      id: entity.id,
      routeIds,
      header,
      description,
      activePeriods,
    });
  }

  return alerts;
}

async function fetchAndDecodeFeed(feedUrl) {
  const res = await fetch(feedUrl, {
    headers: { "Accept": "application/x-protobuf" },
  });

  if (!res.ok) {
    throw new Error(`MTA feed request failed: ${res.status} ${res.statusText}`);
  }

  const buffer = await res.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  return simplifyAlerts(feed);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const feedParam = url.searchParams.get("feed") || "subway-alerts";

    if (feedParam === "list") {
      return jsonResponse({ availableFeeds: Object.keys(FEEDS) });
    }

    const feedUrl = FEEDS[feedParam];
    if (!feedUrl) {
      return jsonResponse(
        { error: `Unknown feed "${feedParam}". Try ?feed=list to see options.` },
        400
      );
    }

    // Use Cloudflare's edge cache so repeated requests within the TTL
    // don't each trigger a fresh fetch to MTA.
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const alerts = await fetchAndDecodeFeed(feedUrl);
      const response = jsonResponse({
        feed: feedParam,
        fetchedAt: new Date().toISOString(),
        count: alerts.length,
        alerts,
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (err) {
      return jsonResponse({ error: err.message }, 502);
    }
  },
};
