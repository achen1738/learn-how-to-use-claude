import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import subwayLines from './assets/subway-lines.json';

// Keep the map from panning/zooming out past the NYC metro area.
const METRO_BOUNDS = { north: 40.92, south: 40.49, east: -73.68, west: -74.27 };

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function buildMapHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const LINES = ${JSON.stringify(subwayLines)};

    function initMap() {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -73.95 },
        zoom: 11,
        minZoom: 10,
        restriction: { latLngBounds: ${JSON.stringify(METRO_BOUNDS)}, strictBounds: true },
        mapTypeControl: false,
        streetViewControl: false,
      });

      LINES.forEach((line) => {
        new google.maps.Polyline({
          path: line.path.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: line.color,
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map,
        });
      });
    }
  </script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap"></script>
</body>
</html>`;
}

export default function MapScreen() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>
          Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY — add it to frontend/.env.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{ html: buildMapHtml() }} style={styles.map} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  error: { padding: 16, color: 'red' },
});
