import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import subwayLines from '../assets/subway-lines.json';
import subwayStations from '../assets/subway-stations.json';

// Keep the map from panning/zooming out past the NYC metro area.
const METRO_BOUNDS = { north: 40.92, south: 40.49, east: -73.68, west: -74.27 };

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// iOS simulator/web can reach the Mac/PC directly via localhost.
// Android emulator needs 10.0.2.2 instead. A physical device needs your
// machine's LAN IP (e.g. http://192.168.1.23:8787).
const API_BASE = 'http://192.168.1.185:8787';

// Static page shell for the WebView. No data is baked into this — it never
// changes, so it's a plain constant instead of something rebuilt on render.
const MAP_SHELL_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
</body>
</html>`;

// Groups alerts by the station(s) each one's informedEntity.stopId refers to.
function groupAlertsByStation(alerts) {
  const byStation = {};
  for (const alert of alerts) {
    for (const stopId of alert.stopIds) {
      if (!byStation[stopId]) byStation[stopId] = [];
      byStation[stopId].push(alert);
    }
  }
  return byStation;
}

// Loads the map and creates every marker exactly once. Re-appending the
// Google Maps <script> tag a second time (e.g. once alerts load) doesn't
// reliably re-fire the callback once the library is already loaded, so
// alert data can't be delivered by re-running this whole script — it has to
// update existing markers in place instead (see buildApplyAlertsScript).
//
// The map-drawing logic below has to be written as literal text in this
// template (not as a real function passed through .toString()) — Hermes,
// React Native's JS engine, doesn't preserve real source for
// Function.prototype.toString() on compiled functions, so a stringified
// function silently injects an empty shell instead of its actual body.
function buildInitialLoadScript() {
  return `
    window.initMap = function () {
      const lines = ${JSON.stringify(subwayLines)};
      const stations = ${JSON.stringify(subwayStations)};
      const bounds = ${JSON.stringify(METRO_BOUNDS)};

      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -73.95 },
        zoom: 11,
        minZoom: 10,
        restriction: { latLngBounds: bounds, strictBounds: true },
        mapTypeControl: false,
        streetViewControl: false,
      });

      lines.forEach(function (line) {
        new google.maps.Polyline({
          path: line.path.map(function (p) { return { lat: p[0], lng: p[1] }; }),
          strokeColor: line.color,
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map,
        });
      });

      const infoWindow = new google.maps.InfoWindow();
      const markersByStation = {};

      const CIRCLE_ICON = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        fillColor: '#000000',
        fillOpacity: 0.85,
        strokeColor: '#ffffff',
        strokeWeight: 1,
      };

      // Alert-affected stations get a pressable square instead of a plain
      // dot — google.maps.SymbolPath has no built-in square, so it's a
      // small SVG path instead.
      const SQUARE_ICON = {
        path: 'M -5,-5 5,-5 5,5 -5,5 z',
        fillColor: '#9c27b0',
        fillOpacity: 0.95,
        strokeColor: '#ffffff',
        strokeWeight: 1,
      };

      stations.forEach(function (station) {
        const marker = new google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map,
          title: station.name,
          icon: CIRCLE_ICON,
          zIndex: 1,
        });
        marker.__alerts = [];

        marker.addListener('click', function () {
          const alertsHtml = marker.__alerts
            .map(function (a) {
              return (
                '<p style="margin: 8px 0 0;"><strong>' + a.header + '</strong>' +
                (a.description ? '<br/>' + a.description : '') +
                '</p>'
              );
            })
            .join('');

          infoWindow.setContent(
            '<div style="font-family: sans-serif; max-width: 240px;">' +
              '<strong>' + station.name + '</strong><br/>' +
              station.routes.join(', ') +
              alertsHtml +
            '</div>'
          );
          infoWindow.open(map, marker);
        });

        markersByStation[station.id] = marker;
      });

      // Updates existing markers in place once alert data is available —
      // safe to call multiple times, never touches the map or script tag.
      window.applyStationAlerts = function (stationAlerts) {
        Object.keys(markersByStation).forEach(function (stationId) {
          const marker = markersByStation[stationId];
          const alerts = stationAlerts[stationId] || [];
          marker.__alerts = alerts;
          marker.setIcon(alerts.length > 0 ? SQUARE_ICON : CIRCLE_ICON);
          marker.setZIndex(alerts.length > 0 ? 2 : 1);
        });
      };

      if (window.__pendingStationAlerts) {
        window.applyStationAlerts(window.__pendingStationAlerts);
        window.__pendingStationAlerts = null;
      }
    };

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap';
    document.head.appendChild(script);
    true;
  `;
}

// Delivers alert data to the already-loaded map. If the map hasn't finished
// loading yet, stash the data for initMap to pick up once it's ready.
function buildApplyAlertsScript(stationAlerts) {
  return `
    if (window.applyStationAlerts) {
      window.applyStationAlerts(${JSON.stringify(stationAlerts)});
    } else {
      window.__pendingStationAlerts = ${JSON.stringify(stationAlerts)};
    }
    true;
  `;
}

export default function SubwayMap() {
  const webviewRef = useRef(null);
  const [stationAlerts, setStationAlerts] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/?feed=subway-alerts`)
      .then((res) => res.json())
      .then((data) => setStationAlerts(groupAlertsByStation(data.alerts || [])))
      .catch(() => setStationAlerts({})); // map still works without alerts
  }, []);

  // The map must never wait on the alerts fetch to appear — load it
  // immediately as soon as the page loads.
  const handleLoad = useCallback(() => {
    webviewRef.current?.injectJavaScript(buildInitialLoadScript());
  }, []);

  // Once alerts arrive, update the already-loaded map's markers in place.
  useEffect(() => {
    if (stationAlerts) {
      webviewRef.current?.injectJavaScript(buildApplyAlertsScript(stationAlerts));
    }
  }, [stationAlerts]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY — add it to frontend/.env.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webviewRef}
      source={{ html: MAP_SHELL_HTML, baseUrl: 'https://localhost' }}
      originWhitelist={['*']}
      onLoad={handleLoad}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  error: { padding: 16, color: 'red' },
});
