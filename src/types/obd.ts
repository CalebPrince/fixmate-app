export type PidKey =
  | 'rpm'
  | 'speed'
  | 'coolantTemp'
  | 'engineLoad'
  | 'shortFuelTrim'
  | 'longFuelTrim'
  | 'intakeAirTemp'
  | 'throttlePosition'
  | 'batteryVoltage';

export interface PidDefinition {
  key: PidKey;
  label: string;
  mode: string;
  pid: string;
  minBytes: number;
  unit: string;
  decode: (bytes: number[]) => number;
}

export interface PidReading {
  key: PidKey;
  value: number;
  unit: string;
  timestamp: number;
}

export interface TroubleCode {
  code: string;
  raw: string;
}

export interface FreezeFrame {
  dtc: string;
  rpm?: number;
  engineLoad?: number;
  coolantTemp?: number;
}

export interface ReadinessMonitor {
  name: string;
  ready: boolean;
}
