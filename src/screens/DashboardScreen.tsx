import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useApp } from '../state/AppContext';
import { Card, Eyebrow, GhostButton } from '../components/ui';
import { describeDtc } from '../obd/dtcDescriptions';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/RootTabs';
import { PidKey } from '../types/obd';

type Props = BottomTabScreenProps<RootTabParamList, 'Live'>;

const GAUGE_KEYS: { key: PidKey; label: string }[] = [
  { key: 'rpm', label: 'RPM' },
  { key: 'speed', label: 'Speed' },
  { key: 'coolantTemp', label: 'Coolant' },
  { key: 'longFuelTrim', label: 'Long fuel trim' },
  { key: 'engineLoad', label: 'Engine load' },
  { key: 'shortFuelTrim', label: 'Short fuel trim' },
];

export function DashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const {
    connectionState,
    connectedDeviceName,
    vehicle,
    telemetry,
    activeCodes,
    refreshing,
    refreshError,
    refresh,
  } = useApp();

  useEffect(() => {
    if (connectionState === 'connected') refresh();
  }, [connectionState, refresh]);

  if (connectionState !== 'connected') {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
          Not connected to a scanner yet.
        </Text>
        <View style={{ height: 12 }} />
        <GhostButton label="Go to Pair" onPress={() => navigation.navigate('Pair')} />
      </View>
    );
  }

  const readingFor = (key: PidKey) => telemetry.find((r) => r.key === key);
  const primaryCode = activeCodes[0];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 24 }}>
      <Eyebrow>Live · connected to {connectedDeviceName}</Eyebrow>
      <Text style={[styles.h1, { color: theme.textPrimary }]}>Right now</Text>

      <View style={{ height: 14 }} />
      <Card>
        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13.5 }}>
          {vehicle.year} {vehicle.make || 'Unknown make'} {vehicle.model || ''}
        </Text>
        {vehicle.mileage ? (
          <Text style={{ color: theme.textTertiary, fontFamily: 'monospace', fontSize: 10.5, marginTop: 2 }}>
            {vehicle.mileage.toLocaleString()} mi
          </Text>
        ) : null}
      </Card>

      {refreshError && (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            backgroundColor: 'rgba(216,72,60,0.12)',
            borderColor: '#EFA298',
          }}
        >
          <Text style={{ color: '#A63325', fontSize: 12.5, lineHeight: 18 }}>{refreshError}</Text>
        </View>
      )}

      {primaryCode && (
        <Pressable
          onPress={() => navigation.navigate('Diagnosis', { dtc: primaryCode.code })}
          style={[styles.alertBanner, { backgroundColor: 'rgba(216,72,60,0.12)', borderColor: '#EFA298' }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#A63325', fontWeight: '700', fontSize: 12.5 }}>
              {activeCodes.length} active trouble code{activeCodes.length > 1 ? 's' : ''}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 1 }}>
              {primaryCode.code} — {describeDtc(primaryCode.code)}
            </Text>
          </View>
        </Pressable>
      )}

      <View style={{ height: 14 }} />
      <View style={styles.gaugeGrid}>
        {GAUGE_KEYS.map(({ key, label }) => {
          const r = readingFor(key);
          return (
            <Card key={key} style={styles.gaugeCard}>
              <Text style={{ color: theme.textTertiary, fontSize: 10.5, fontWeight: '600', textTransform: 'uppercase' }}>
                {label}
              </Text>
              <Text style={{ color: theme.textPrimary, fontFamily: 'monospace', fontSize: 26, fontWeight: '700', marginTop: 4 }}>
                {r ? r.value.toFixed(r.unit === '%' || r.unit === 'V' ? 1 : 0) : '—'}
                <Text style={{ fontSize: 12, color: theme.textTertiary }}> {r?.unit ?? ''}</Text>
              </Text>
            </Card>
          );
        })}
      </View>

      <View style={{ height: 18 }} />
      <GhostButton label={refreshing ? 'Refreshing…' : 'Refresh'} onPress={refresh} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, paddingTop: 24 },
  center: { alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  alertBanner: { borderWidth: 1, borderRadius: 14, padding: 13, marginTop: 12 },
  gaugeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gaugeCard: { width: '48%' },
});
