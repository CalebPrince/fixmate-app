import { PidReading, TroubleCode } from './obd';

export interface VehicleProfile {
  year: number;
  make: string;
  model: string;
  engine?: string;
  mileage?: number;
}

export interface DiagnosisInput {
  vehicle: VehicleProfile;
  activeCodes: TroubleCode[];
  telemetry: PidReading[];
}

export interface LikelyCause {
  name: string;
  probability: number; // 0-100
}

export interface DiagnosisResult {
  dtc: string;
  title: string;
  explanation: string;
  urgency: 1 | 2 | 3 | 4 | 5;
  urgencySummary: string;
  likelyCauses: LikelyCause[];
  diySummary: string;
  diyMinutes?: number;
  mechanicSummary: string;
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
}
