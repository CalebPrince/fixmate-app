import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useApp } from '../state/AppContext';
import { Card, Chip, Eyebrow, PrimaryButton } from '../components/ui';
import { AI_PROVIDER_ORDER, AI_PROVIDERS } from '../ai/registry';
import { AiProviderId } from '../ai/AiProvider';
import { getApiKey, saveApiKey } from '../storage/keyStore';

const BADGE_COLORS: Record<AiProviderId, string> = {
  openai: '#10A37F',
  anthropic: '#C1652B',
  gemini: '#4285F4',
  xai: '#111111',
};

export function SettingsScreen() {
  const theme = useTheme();
  const { vehicle, setVehicle, activeProviderId, setActiveProviderId } = useApp();
  const [yearText, setYearText] = useState(String(vehicle.year));
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [engine, setEngine] = useState(vehicle.engine ?? '');
  const [mileageText, setMileageText] = useState(vehicle.mileage ? String(vehicle.mileage) : '');
  const [keys, setKeys] = useState<Partial<Record<AiProviderId, string>>>({});
  const [saved, setSaved] = useState<Partial<Record<AiProviderId, boolean>>>({});

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        AI_PROVIDER_ORDER.map(async (id) => [id, await getApiKey(id)] as const),
      );
      const loaded: Partial<Record<AiProviderId, string>> = {};
      const has: Partial<Record<AiProviderId, boolean>> = {};
      for (const [id, key] of entries) {
        if (key) {
          loaded[id] = key;
          has[id] = true;
        }
      }
      setKeys(loaded);
      setSaved(has);
    })();
  }, []);

  const onSave = async () => {
    const parsedYear = parseInt(yearText, 10);
    const parsedMileage = parseInt(mileageText, 10);
    setVehicle({
      year: Number.isFinite(parsedYear) ? parsedYear : vehicle.year,
      make: make.trim(),
      model: model.trim(),
      engine: engine.trim() || undefined,
      mileage: Number.isFinite(parsedMileage) ? parsedMileage : undefined,
    });

    for (const id of AI_PROVIDER_ORDER) {
      const value = keys[id];
      if (value) {
        await saveApiKey(id, value);
        setSaved((s) => ({ ...s, [id]: true }));
      }
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 24 }}>
      <Eyebrow>Settings · vehicle</Eyebrow>
      <Text style={[styles.h1, { color: theme.textPrimary }]}>Your vehicle</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 13.5, marginTop: 6, lineHeight: 19 }}>
        Used to give the AI context for its diagnosis — the same code can mean different things on
        different vehicles.
      </Text>

      <View style={{ height: 16 }} />
      <Card style={{ marginBottom: 20 }}>
        <View style={styles.vehicleRow}>
          <LabeledInput label="Year" value={yearText} onChangeText={setYearText} keyboardType="number-pad" theme={theme} flex={1} />
          <LabeledInput label="Make" value={make} onChangeText={setMake} placeholder="Hyundai" theme={theme} flex={2} />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.vehicleRow}>
          <LabeledInput label="Model" value={model} onChangeText={setModel} placeholder="Santa Fe" theme={theme} flex={2} />
          <LabeledInput label="Mileage" value={mileageText} onChangeText={setMileageText} keyboardType="number-pad" theme={theme} flex={1} />
        </View>
        <View style={{ height: 10 }} />
        <LabeledInput label="Engine (optional)" value={engine} onChangeText={setEngine} placeholder="2.4L" theme={theme} />
      </Card>

      <Eyebrow>Settings · AI provider</Eyebrow>
      <Text style={[styles.h1, { color: theme.textPrimary }]}>Connect your AI</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 13.5, marginTop: 6, lineHeight: 19 }}>
        Add a key for any provider below. Only the active one is used for diagnoses.
      </Text>

      <View style={{ height: 16 }} />
      {AI_PROVIDER_ORDER.map((id) => {
        const provider = AI_PROVIDERS[id];
        return (
          <Card key={id} style={{ marginBottom: 10 }}>
            <View style={styles.providerHead}>
              <View style={[styles.badge, { backgroundColor: BADGE_COLORS[id] }]}>
                <Text style={styles.badgeText}>{provider.label[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13.5 }}>{provider.label}</Text>
                <Text style={{ color: theme.textTertiary, fontFamily: 'monospace', fontSize: 10.5, marginTop: 1 }}>
                  {provider.modelLabel}
                </Text>
              </View>
              <Chip label={saved[id] ? 'Connected' : 'Not set'} tone={saved[id] ? 'safe' : 'neutral'} />
            </View>

            <View style={{ height: 10 }} />
            <TextInput
              value={keys[id] ?? ''}
              onChangeText={(text) => setKeys((k) => ({ ...k, [id]: text }))}
              placeholder={provider.keyPlaceholder}
              placeholderTextColor={theme.textTertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                { backgroundColor: theme.surfaceSunken, borderColor: theme.border, color: theme.textPrimary },
              ]}
            />

            <View style={{ height: 10 }} />
            <RadioRow
              label="Use for diagnoses"
              selected={activeProviderId === id}
              onPress={() => setActiveProviderId(id)}
              theme={theme}
            />
          </Card>
        );
      })}

      <Card style={{ flexDirection: 'row', gap: 9, backgroundColor: theme.surfaceSunken, borderColor: 'transparent' }}>
        <Text style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 16, flex: 1 }}>
          Keys are stored only on this device (OS keychain) and sent directly to the provider you
          choose — never through our servers.
        </Text>
      </Card>

      <View style={{ height: 14 }} />
      <PrimaryButton label="Save changes" onPress={onSave} />
    </ScrollView>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  theme,
  flex,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  theme: ReturnType<typeof useTheme>;
  flex?: number;
}) {
  return (
    <View style={{ flex: flex ?? 1 }}>
      <Text style={{ color: theme.textTertiary, fontSize: 10.5, fontWeight: '600', marginBottom: 5 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        style={[
          styles.vehicleInput,
          { backgroundColor: theme.surfaceSunken, borderColor: theme.border, color: theme.textPrimary },
        ]}
      />
    </View>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Text
      onPress={onPress}
      style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500' }}
    >
      <Text style={{ color: selected ? theme.accent : theme.textTertiary }}>{selected ? '● ' : '○ '}</Text>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, paddingTop: 24 },
  h1: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  providerHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FBF3EC', fontWeight: '800', fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, fontFamily: 'monospace', fontSize: 12.5 },
  vehicleRow: { flexDirection: 'row', gap: 10 },
  vehicleInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13.5 },
});
