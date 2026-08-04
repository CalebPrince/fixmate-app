import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useApp } from '../state/AppContext';
import { Eyebrow, PrimaryButton } from '../components/ui';
import { ScannedDevice } from '../types/ble';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/RootTabs';

type Props = BottomTabScreenProps<RootTabParamList, 'Pair'>;

export function PairScreen({ navigation }: Props) {
  const theme = useTheme();
  const { connectionState, connectedDeviceName, connectionError, scannedDevices, scan, connect } = useApp();

  const onConnect = async (device: ScannedDevice) => {
    try {
      await connect(device);
      navigation.navigate('Live');
    } catch {
      // surfaced via connectionState reverting to disconnected; nothing further to do here
    }
  };

  if (connectionState === 'connected') {
    return (
      <View style={[styles.screen, { backgroundColor: theme.bg }]}>
        <View style={styles.connectedWrap}>
          <View style={[styles.connectedBadge, { backgroundColor: 'rgba(63,157,88,0.14)' }]}>
            <Text style={{ fontSize: 28 }}>✓</Text>
          </View>
          <Text style={[styles.h1, { color: theme.textPrimary }]}>Connected</Text>
          <Text style={{ color: theme.textSecondary, fontFamily: 'monospace' }}>
            {connectedDeviceName}
          </Text>
          <View style={{ height: 12 }} />
          <PrimaryButton label="Continue to live data" onPress={() => navigation.navigate('Live')} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Eyebrow>Bluetooth · scanning</Eyebrow>
      <Text style={[styles.h1, { color: theme.textPrimary }]}>Find your scanner</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>
        Plug the adapter into the port under your dashboard, then turn the key to ON.
      </Text>

      <View style={{ height: 20 }} />
      <PrimaryButton
        label={connectionState === 'scanning' ? 'Scanning…' : 'Scan for devices'}
        onPress={scan}
        disabled={connectionState === 'scanning'}
      />
      <View style={{ height: 16 }} />

      {connectionError && (
        <View style={[styles.errorBanner, { backgroundColor: 'rgba(216,72,60,0.12)', borderColor: '#EFA298' }]}>
          <Text style={{ color: '#A63325', fontSize: 12.5, lineHeight: 18 }}>{connectionError}</Text>
        </View>
      )}

      {connectionState === 'scanning' && scannedDevices.length === 0 && (
        <ActivityIndicator color={theme.accent} />
      )}

      {connectionState === 'disconnected' && !connectionError && scannedDevices.length === 0 && (
        <Text style={{ color: theme.textTertiary, fontSize: 12.5, textAlign: 'center' }}>
          No devices found yet. Make sure the scanner is powered and try again.
        </Text>
      )}

      <FlatList
        data={scannedDevices}
        keyExtractor={(d) => d.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onConnect(item)}
            style={[styles.deviceRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
              <Text style={{ color: theme.textTertiary, fontFamily: 'monospace', fontSize: 11, marginTop: 2 }}>
                {item.id} {item.rssi !== null ? `· ${item.rssi} dBm` : ''}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, paddingTop: 24 },
  h1: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  sub: { fontSize: 13.5, marginTop: 6, lineHeight: 19, maxWidth: 320 },
  deviceRow: { borderWidth: 1, borderRadius: 14, padding: 13 },
  errorBanner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  connectedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  connectedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
