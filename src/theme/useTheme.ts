import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './colors';

/**
 * Custom fonts (Big Shoulders Display / IBM Plex Sans / IBM Plex Mono) from the
 * mockup aren't bundled as native assets yet — using system fonts as a close
 * stand-in for now. Swap these for the real families once .ttf assets are
 * linked via react-native.config.js.
 */
export const fonts = {
  display: undefined, // falls back to System, bold weight applied per-use
  body: undefined,
  mono: 'monospace',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
