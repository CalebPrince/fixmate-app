import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useApp } from '../state/AppContext';
import { Card, Eyebrow, GhostButton, PrimaryButton } from '../components/ui';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/RootTabs';

type Props = BottomTabScreenProps<RootTabParamList, 'Diagnosis'>;

const URGENCY_LABEL: Record<number, string> = {
  1: 'No rush',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Urgent',
};

export function DiagnosisScreen({ route }: Props) {
  const theme = useTheme();
  const { activeCodes, diagnosis, diagnosisLoading, diagnosisError, runDiagnosis } = useApp();

  const targetDtc = route.params?.dtc ?? activeCodes[0]?.code;

  useEffect(() => {
    if (targetDtc && diagnosis?.dtc !== targetDtc && !diagnosisLoading) {
      runDiagnosis(targetDtc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDtc]);

  const urgencyColor = useMemo(() => {
    const u = diagnosis?.urgency ?? 0;
    if (u >= 4) return '#A63325';
    if (u >= 3) return '#B57E14';
    return '#2F7A45';
  }, [diagnosis]);

  if (!targetDtc) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
          No active trouble codes to diagnose right now.
        </Text>
      </View>
    );
  }

  if (diagnosisLoading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Asking the AI about {targetDtc}…</Text>
      </View>
    );
  }

  if (diagnosisError) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: '#A63325', textAlign: 'center', fontWeight: '600' }}>{diagnosisError}</Text>
        <View style={{ height: 12 }} />
        <GhostButton label="Try again" onPress={() => runDiagnosis(targetDtc)} />
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.bg }]}>
        <PrimaryButton label={`Diagnose ${targetDtc}`} onPress={() => runDiagnosis(targetDtc)} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 24 }}>
      <Eyebrow>AI diagnosis</Eyebrow>
      <Text style={{ color: theme.accentStrong, fontFamily: 'monospace', fontSize: 12, marginTop: 6 }}>
        {diagnosis.dtc}
      </Text>
      <Text style={[styles.h1, { color: theme.textPrimary }]}>{diagnosis.title}</Text>

      <View style={{ height: 14 }} />
      <Card>
        <View style={styles.meter}>
          {[1, 2, 3, 4, 5].map((n) => (
            <View
              key={n}
              style={[
                styles.meterSeg,
                { backgroundColor: n <= diagnosis.urgency ? urgencyColor : theme.border },
              ]}
            />
          ))}
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 8 }}>
          <Text style={{ color: urgencyColor, fontWeight: '700' }}>
            Urgency {diagnosis.urgency}/5 · {URGENCY_LABEL[diagnosis.urgency]}
          </Text>
          {'  '}
          {diagnosis.urgencySummary}
        </Text>
      </Card>

      <SectionTitle theme={theme}>What's happening</SectionTitle>
      <Text style={{ color: theme.textPrimary, fontSize: 14, lineHeight: 21 }}>{diagnosis.explanation}</Text>

      <SectionTitle theme={theme}>Likely causes</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {diagnosis.likelyCauses.map((c, i) => (
          <View
            key={c.name}
            style={[
              styles.causeRow,
              { borderBottomColor: theme.border, borderBottomWidth: i === diagnosis.likelyCauses.length - 1 ? 0 : 1 },
            ]}
          >
            <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 13, fontWeight: '500' }}>{c.name}</Text>
            <Text style={{ color: theme.textSecondary, fontFamily: 'monospace', fontSize: 11.5 }}>
              {Math.round(c.probability)}%
            </Text>
          </View>
        ))}
      </Card>

      <SectionTitle theme={theme}>Next step</SectionTitle>
      <View style={styles.actionGrid}>
        <Card style={{ flex: 1 }}>
          <Text style={{ color: theme.textTertiary, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' }}>
            DIY check
          </Text>
          <Text style={{ color: theme.textPrimary, fontSize: 19, fontWeight: '700', marginTop: 3 }}>
            {diagnosis.diyMinutes ? `${diagnosis.diyMinutes} min` : '—'}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 4, lineHeight: 15 }}>
            {diagnosis.diySummary}
          </Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ color: theme.textTertiary, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase' }}>
            Mechanic fix
          </Text>
          <Text style={{ color: theme.textPrimary, fontFamily: 'monospace', fontSize: 19, fontWeight: '700', marginTop: 3 }}>
            {diagnosis.estimatedCostLow && diagnosis.estimatedCostHigh
              ? `$${diagnosis.estimatedCostLow}–${diagnosis.estimatedCostHigh}`
              : '—'}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 4, lineHeight: 15 }}>
            {diagnosis.mechanicSummary}
          </Text>
        </Card>
      </View>

      <Text style={[styles.disclaimer, { color: theme.textTertiary, borderTopColor: theme.border }]}>
        AI-generated guidance based on generic OBD-II data — not a substitute for a certified mechanic's inspection.
      </Text>
    </ScrollView>
  );
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <Text
      style={{
        color: theme.textTertiary,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, paddingTop: 24 },
  center: { alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  meter: { flexDirection: 'row', gap: 3 },
  meterSeg: { flex: 1, height: 7, borderRadius: 3 },
  causeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  actionGrid: { flexDirection: 'row', gap: 8 },
  disclaimer: { fontSize: 10.5, lineHeight: 15, marginTop: 20, paddingTop: 14, borderTopWidth: 1 },
});
