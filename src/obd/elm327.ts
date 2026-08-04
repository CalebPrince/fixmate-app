import { TroubleCode } from '../types/obd';

/** AT command sequence to get a fresh ELM327-compatible adapter into a known state. */
export const INIT_COMMANDS = ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH0', 'ATSP0'];

export function buildPidCommand(mode: string, pid: string): string {
  return `${mode}${pid}`;
}

/**
 * Adapters echo the command, then reply with hex bytes, then a ">" prompt.
 * Strips all of that noise down to the raw hex payload lines.
 */
export function extractHexLines(raw: string): string[] {
  return raw
    .split(/[\r\n]+/)
    .map((line) => line.replace(/>/g, '').trim())
    .filter((line) => line.length > 0 && !/^SEARCHING/i.test(line));
}

const HEX_BYTE = /^[0-9A-F]{2}$/i;

function tokensToBytes(tokens: string[]): number[] {
  return tokens.filter((t) => HEX_BYTE.test(t)).map((t) => parseInt(t, 16));
}

/**
 * Parses a Mode 01 PID response line (e.g. "41 0C 09 92") into the data
 * bytes that follow the echoed mode+pid header. Returns null if this line
 * isn't a response to the given mode/pid.
 */
export function parsePidResponseLine(mode: string, pid: string, line: string): number[] | null {
  const tokens = line.split(/\s+/);
  const bytes = tokensToBytes(tokens);
  if (bytes.length < 2) return null;

  const expectedModeByte = parseInt(mode, 16) + 0x40;
  const expectedPidByte = parseInt(pid, 16);
  if (bytes[0] !== expectedModeByte || bytes[1] !== expectedPidByte) return null;

  return bytes.slice(2);
}

const DTC_LETTER = ['P', 'C', 'B', 'U'];

/** Decodes a Mode 03/07 trouble-code response (SAE J2012) into readable DTCs. */
export function decodeDtcBytes(bytes: number[]): TroubleCode[] {
  const codes: TroubleCode[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const a = bytes[i];
    const b = bytes[i + 1];
    if (a === 0 && b === 0) continue;

    const letter = DTC_LETTER[(a >> 6) & 0x03];
    const digit1 = (a >> 4) & 0x03;
    const digit2 = (a & 0x0f).toString(16).toUpperCase();
    const digit34 = b.toString(16).toUpperCase().padStart(2, '0');

    const code = `${letter}${digit1}${digit2}${digit34}`;
    codes.push({ code, raw: `${a.toString(16)}${b.toString(16)}` });
  }
  return codes;
}

/** Extracts data bytes from a Mode 03 response line (header byte 0x43). */
export function parseDtcResponseLine(line: string): number[] | null {
  const tokens = line.split(/\s+/);
  const bytes = tokensToBytes(tokens);
  if (bytes.length < 1 || bytes[0] !== 0x43) return null;
  return bytes.slice(1);
}
