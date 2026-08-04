/**
 * Small offline baseline so a code means *something* with zero connectivity,
 * before the AI enrichment layer adds the real diagnosis. Not exhaustive —
 * covers the handful of codes people hit most often.
 */
export const DTC_DESCRIPTIONS: Record<string, string> = {
  P0300: 'Random/multiple cylinder misfire detected',
  P0301: 'Cylinder 1 misfire detected',
  P0302: 'Cylinder 2 misfire detected',
  P0303: 'Cylinder 3 misfire detected',
  P0304: 'Cylinder 4 misfire detected',
  P0171: 'System too lean (Bank 1)',
  P0174: 'System too lean (Bank 2)',
  P0172: 'System too rich (Bank 1)',
  P0420: 'Catalyst system efficiency below threshold (Bank 1)',
  P0430: 'Catalyst system efficiency below threshold (Bank 2)',
  P0128: 'Coolant thermostat below regulating temperature',
  P0442: 'EVAP system leak detected (small leak)',
  P0455: 'EVAP system leak detected (large leak)',
  P0505: 'Idle control system malfunction',
  P0113: 'Intake air temperature sensor circuit high input',
  P0117: 'Engine coolant temperature sensor circuit low input',
  P0121: 'Throttle position sensor circuit range/performance problem',
};

export function describeDtc(code: string): string {
  return DTC_DESCRIPTIONS[code] ?? 'Trouble code detected — description not in the offline list yet.';
}
