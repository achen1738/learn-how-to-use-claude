// One-off conversion: MTA static GTFS (stops.txt/stop_times.txt/trips.txt)
// -> a compact JSON file of station markers: name, location, and which
// routes serve each station.
//
// Usage: node scripts/build-subway-stations.js <path-to-extracted-gtfs-dir>
const fs = require('fs');
const path = require('path');

const GTFS_DIR = process.argv[2];
if (!GTFS_DIR) {
  console.error('Usage: node build-subway-stations.js <path-to-extracted-gtfs-dir>');
  process.exit(1);
}

const OUT_FILE = path.join(__dirname, '..', 'assets', 'subway-stations.json');

function readLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
}

function readCsv(filePath) {
  const lines = readLines(filePath);
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const fields = line.split(',');
    const row = {};
    header.forEach((h, i) => {
      row[h] = fields[i];
    });
    return row;
  });
}

// --- stops.txt: parent stations (location_type=1) + child platform stops,
// which stop_times.txt actually references (e.g. "101N"/"101S" -> parent "101").
const stations = {}; // stop_id -> { id, name, lat, lng, routes: Set }
const childToParent = {};

for (const row of readCsv(path.join(GTFS_DIR, 'stops.txt'))) {
  if (row.location_type === '1') {
    stations[row.stop_id] = {
      id: row.stop_id,
      name: row.stop_name,
      lat: Number(row.stop_lat),
      lng: Number(row.stop_lon),
      routes: new Set(),
    };
  } else if (row.parent_station) {
    childToParent[row.stop_id] = row.parent_station;
  }
}

// --- trips.txt: trip_id -> route_id
const tripToRoute = {};
for (const row of readCsv(path.join(GTFS_DIR, 'trips.txt'))) {
  tripToRoute[row.trip_id] = row.route_id;
}

// --- stop_times.txt: trip_id + stop_id -> resolve to parent station,
// tag it with the trip's route. Large file (500k+ rows), plain split is fine.
const stopTimesLines = readLines(path.join(GTFS_DIR, 'stop_times.txt'));
const stHeader = stopTimesLines[0].split(',');
const tripIdx = stHeader.indexOf('trip_id');
const stopIdx = stHeader.indexOf('stop_id');

for (let i = 1; i < stopTimesLines.length; i++) {
  const fields = stopTimesLines[i].split(',');
  const stopId = fields[stopIdx];
  const parentId = childToParent[stopId] || stopId;
  const station = stations[parentId];
  if (!station) continue;

  const route = tripToRoute[fields[tripIdx]];
  if (route) station.routes.add(route);
}

const output = Object.values(stations).map((s) => ({
  id: s.id,
  name: s.name,
  lat: s.lat,
  lng: s.lng,
  routes: [...s.routes].sort(),
}));

fs.writeFileSync(OUT_FILE, JSON.stringify(output));
console.log(`Wrote ${output.length} stations to ${OUT_FILE}`);
