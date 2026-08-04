/**
 * Fixmate — OBD-II companion app
 *
 * @format
 */

import React, { useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { AppProvider } from './src/state/AppContext';
import { RootTabs } from './src/navigation/RootTabs';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Wait until the navigator has actually painted its first screen before
  // dismissing the native splash — hiding it any earlier would flash blank content.
  const onNavigationReady = useCallback(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppProvider>
        <NavigationContainer onReady={onNavigationReady}>
          <RootTabs />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
