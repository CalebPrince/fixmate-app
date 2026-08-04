import { BleService } from '../ble/BleService';
import { PIDS } from './pids';
import {
  buildPidCommand,
  decodeDtcBytes,
  extractHexLines,
  parseDtcResponseLine,
  parsePidResponseLine,
} from './elm327';
import { PidKey, PidReading, TroubleCode } from '../types/obd';

/** Sits on top of BleService and speaks OBD-II instead of raw AT commands. */
export class ObdClient {
  constructor(private ble: BleService) {}

  async readPid(key: PidKey): Promise<PidReading | null> {
    const def = PIDS.find((p) => p.key === key);
    if (!def) return null;

    const raw = await this.ble.sendCommand(buildPidCommand(def.mode, def.pid));
    const lines = extractHexLines(raw);

    for (const line of lines) {
      const bytes = parsePidResponseLine(def.mode, def.pid, line);
      if (bytes && bytes.length >= def.minBytes) {
        return {
          key: def.key,
          value: def.decode(bytes),
          unit: def.unit,
          timestamp: Date.now(),
        };
      }
    }
    return null;
  }

  async readAllPids(): Promise<PidReading[]> {
    const readings: PidReading[] = [];
    for (const def of PIDS) {
      try {
        const reading = await this.readPid(def.key);
        if (reading) readings.push(reading);
      } catch {
        // adapter didn't support this PID or timed out — skip it, keep going
      }
    }
    return readings;
  }

  async readTroubleCodes(): Promise<TroubleCode[]> {
    const raw = await this.ble.sendCommand('03');
    const lines = extractHexLines(raw);
    const codes: TroubleCode[] = [];

    for (const line of lines) {
      const bytes = parseDtcResponseLine(line);
      if (bytes) codes.push(...decodeDtcBytes(bytes));
    }
    return codes;
  }

  async clearTroubleCodes(): Promise<void> {
    await this.ble.sendCommand('04');
  }
}
