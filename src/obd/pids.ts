import { PidDefinition } from '../types/obd';

/**
 * Standard (generic) OBD-II Mode 01 PIDs, SAE J1979.
 * Every compliant vehicle since 1996 (US) reports these the same way,
 * regardless of make/model — this is what makes "works with any car" possible.
 */
export const PIDS: PidDefinition[] = [
  {
    key: 'rpm',
    label: 'RPM',
    mode: '01',
    pid: '0C',
    minBytes: 2,
    unit: 'rpm',
    decode: ([a, b]) => ((a * 256 + b) / 4),
  },
  {
    key: 'speed',
    label: 'Speed',
    mode: '01',
    pid: '0D',
    minBytes: 1,
    unit: 'km/h',
    decode: ([a]) => a,
  },
  {
    key: 'coolantTemp',
    label: 'Coolant temp',
    mode: '01',
    pid: '05',
    minBytes: 1,
    unit: '°C',
    decode: ([a]) => a - 40,
  },
  {
    key: 'engineLoad',
    label: 'Engine load',
    mode: '01',
    pid: '04',
    minBytes: 1,
    unit: '%',
    decode: ([a]) => (a * 100) / 255,
  },
  {
    key: 'shortFuelTrim',
    label: 'Short fuel trim',
    mode: '01',
    pid: '06',
    minBytes: 1,
    unit: '%',
    decode: ([a]) => (a - 128) * (100 / 128),
  },
  {
    key: 'longFuelTrim',
    label: 'Long fuel trim',
    mode: '01',
    pid: '07',
    minBytes: 1,
    unit: '%',
    decode: ([a]) => (a - 128) * (100 / 128),
  },
  {
    key: 'intakeAirTemp',
    label: 'Intake air temp',
    mode: '01',
    pid: '0F',
    minBytes: 1,
    unit: '°C',
    decode: ([a]) => a - 40,
  },
  {
    key: 'throttlePosition',
    label: 'Throttle position',
    mode: '01',
    pid: '11',
    minBytes: 1,
    unit: '%',
    decode: ([a]) => (a * 100) / 255,
  },
  {
    key: 'batteryVoltage',
    label: 'Battery voltage',
    mode: '01',
    pid: '42',
    minBytes: 2,
    unit: 'V',
    decode: ([a, b]) => (a * 256 + b) / 1000,
  },
];

export function findPid(key: string): PidDefinition | undefined {
  return PIDS.find((p) => p.key === key);
}
