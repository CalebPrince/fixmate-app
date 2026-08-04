/** Same palette as the HTML mockup — graphite/steel neutrals, copper brand accent, traffic-style semantic states. */
export const palette = {
  graphite950: '#100E0B',
  graphite900: '#16140F',
  graphite800: '#211E17',
  graphite700: '#322D23',
  graphite600: '#4A4335',
  graphite500: '#665D4B',
  graphite300: '#ADA48D',
  graphite100: '#E7E3D6',
  graphite50: '#F1EFE7',

  steel50: '#F4F5F2',
  steel100: '#E7E9E3',
  steel200: '#D3D6CC',
  steel300: '#B7BBAD',
  steel600: '#5C6154',

  copper600: '#B5551F',
  copper500: '#C1652B',
  copper400: '#D68243',
  copperGlow: 'rgba(193, 101, 43, 0.16)',

  safe600: '#2F7A45',
  safe500: '#3F9D58',
  safeGlow: 'rgba(63, 157, 88, 0.14)',

  caution600: '#B57E14',
  caution500: '#E0A130',
  cautionGlow: 'rgba(224, 161, 48, 0.16)',

  critical600: '#A63325',
  critical500: '#D8483C',
  criticalGlow: 'rgba(216, 72, 60, 0.14)',
};

export interface Theme {
  bg: string;
  surface: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnAccent: string;
  accent: string;
  accentStrong: string;
}

export const lightTheme: Theme = {
  bg: palette.steel50,
  surface: '#FFFFFF',
  surfaceSunken: palette.steel100,
  border: palette.steel200,
  borderStrong: palette.steel300,
  textPrimary: palette.graphite900,
  textSecondary: palette.steel600,
  textTertiary: palette.steel300,
  textOnAccent: '#FBF3EC',
  accent: palette.copper500,
  accentStrong: palette.copper600,
};

export const darkTheme: Theme = {
  bg: palette.graphite900,
  surface: palette.graphite800,
  surfaceSunken: palette.graphite950,
  border: palette.graphite700,
  borderStrong: palette.graphite600,
  textPrimary: palette.graphite50,
  textSecondary: palette.graphite300,
  textTertiary: palette.graphite500,
  textOnAccent: '#FBF3EC',
  accent: palette.copper400,
  accentStrong: palette.copper500,
};
