import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ChipTone = 'safe' | 'caution' | 'critical' | 'neutral';

export function Chip({ label, tone }: { label: string; tone: ChipTone }) {
  const theme = useTheme();
  const toneStyles: Record<ChipTone, { bg: string; fg: string }> = {
    safe: { bg: 'rgba(63, 157, 88, 0.14)', fg: '#2F7A45' },
    caution: { bg: 'rgba(224, 161, 48, 0.16)', fg: '#B57E14' },
    critical: { bg: 'rgba(216, 72, 60, 0.14)', fg: '#A63325' },
    neutral: { bg: theme.surfaceSunken, fg: theme.textSecondary },
  };
  const c = toneStyles[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <View style={[styles.chipDot, { backgroundColor: c.fg }]} />
      <Text style={[styles.chipText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: theme.accent,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.btnText, { color: theme.textOnAccent }]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: theme.surfaceSunken,
          borderWidth: 1,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.btnText, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <Text style={[styles.eyebrow, { color: theme.textTertiary }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: '500', fontFamily: 'monospace' },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 14.5, fontWeight: '600' },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
