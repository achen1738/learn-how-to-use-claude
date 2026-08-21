// One-off conversion: MTA static GTFS (routes.txt/trips.txt/shapes.txt) -> a
// compact JSON file of subway line paths + colors for the map screen.
//
// Usage: node scripts/build-subway-lines.js <path-to-extracted-gtfs-dir>
const fs = require('fs');
const path = require('path');

const GTFS_DIR = process.argv[2];
if (!GTFS_DIR) {
  console.error('Usage: node build-subway-lines.js <path-to-extracted-gtfs-dir>');
  process.exit(1);
}

const OUT_FILE = path.join(__dirname, '..', 'assets', 'subway-lines.json');

// Minimal RFC4180-ish CSV line parser (handles quoted fields with commas,
// which routes.txt needs for route_desc; shapes.txt/trips.txt have no
// quoted fields so a plain split is fine and much faster for those).
function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function readCsv(filePath, { quoted = false } = {}) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
  const header = (quoted ? parseCsvLine(lines[0]) : lines[0].split(',')).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const fields = quoted ? parseCsvLine(line) : line.split(',');
    const row = {};
    header.forEach((h, i) => {
      row[h] = fields[i];
    });
    return row;
  });
}

const routeColors = {};
for (const r of readCsv(path.join(GTFS_DIR, 'routes.txt'), { quoted: true })) {
  routeColors[r.route_id] = `#${r.route_color || '808183'}`;
}

const shapeToRoute = {};
for (const t of readCsv(path.join(GTFS_DIR, 'trips.txt'))) {
  if (!shapeToRoute[t.shape_id]) shapeToRoute[t.shape_id] = t.route_id;
}

const round = (n) => Math.round(n * 1e5) / 1e5;

const shapePoints = {};
for (const row of readCsv(path.join(GTFS_DIR, 'shapes.txt'))) {
  const id = row.shape_id;
  (shapePoints[id] ||= []).push({
    seq: Number(row.shape_pt_sequence),
    lat: round(Number(row.shape_pt_lat)),
    lng: round(Number(row.shape_pt_lon)),
  });
}

const lines = [];
for (const [shapeId, points] of Object.entries(shapePoints)) {
  const route = shapeToRoute[shapeId];
  if (!route) continue;
  points.sort((a, b) => a.seq - b.seq);
  lines.push({
    route,
    color: routeColors[route] || '#808183',
    path: points.map((p) => [p.lat, p.lng]),
  });
}

fs.writeFileSync(OUT_FILE, JSON.stringify(lines));
console.log(`Wrote ${lines.length} line shapes (${routeColors && Object.keys(routeColors).length} routes) to ${OUT_FILE}`);
