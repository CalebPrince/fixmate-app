import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/useTheme';
import { PairScreen } from '../screens/PairScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DiagnosisScreen } from '../screens/DiagnosisScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Pair: undefined;
  Live: undefined;
  Diagnosis: { dtc?: string } | undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, string> = {
  Pair: '⚉',
  Live: '◉',
  Diagnosis: '⚠',
  Settings: '⚙',
};

export function RootTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 16, color }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Pair" component={PairScreen} />
      <Tab.Screen name="Live" component={DashboardScreen} />
      <Tab.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
