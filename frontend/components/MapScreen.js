import { SafeAreaView, StyleSheet } from 'react-native';
import SubwayMap from './SubwayMap';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SubwayMap />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
