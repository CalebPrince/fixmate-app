import { describeDtc } from '../obd/dtcDescriptions';
import { DiagnosisInput, DiagnosisResult } from '../types/diagnosis';

export const SYSTEM_PROMPT = `You are an expert automotive technician helping a non-technical car owner understand what their OBD-II scanner found. Be direct, practical, and honest about uncertainty. Err toward caution on urgency — a driver's safety matters more than sounding reassuring.

Respond with ONLY a single raw JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "dtc": string,               // the primary trouble code this diagnosis is about
  "title": string,             // short plain-English name, e.g. "Random cylinder misfire"
  "explanation": string,       // 2-4 sentences, plain English, no jargon
  "urgency": number,           // 1-5. 1 = cosmetic/no rush, 5 = pull over now / do not drive
  "urgencySummary": string,    // one short sentence, e.g. "Safe to drive short distances, get it checked within a week."
  "likelyCauses": [ { "name": string, "probability": number } ],  // probabilities are 0-100 and should sum to roughly 100, ranked most likely first, 2-4 entries
  "diySummary": string,        // what a DIY-capable owner could check/try first, one short sentence
  "diyMinutes": number,        // rough time estimate for the DIY check, in minutes
  "mechanicSummary": string,   // what a shop would actually do, one short sentence
  "estimatedCostLow": number,  // USD, typical low end of the repair
  "estimatedCostHigh": number  // USD, typical high end of the repair
}`;

export function buildUserPrompt(input: DiagnosisInput): string {
  const { vehicle, activeCodes, telemetry } = input;

  const codesBlock = activeCodes
    .map((c) => `- ${c.code}: ${describeDtc(c.code)}`)
    .join('\n');

  const telemetryBlock = telemetry
    .map((r) => `- ${r.key}: ${r.value.toFixed(1)} ${r.unit}`)
    .join('\n');

  return `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.engine ? ` (${vehicle.engine})` : ''}${
    vehicle.mileage ? `, ${vehicle.mileage.toLocaleString()} miles` : ''
  }

Active trouble codes:
${codesBlock || '- none'}

Live telemetry snapshot:
${telemetryBlock || '- not available'}

Diagnose the primary active trouble code above for this specific vehicle and telemetry.`;
}

/** Providers occasionally wrap JSON in prose or code fences despite instructions — salvage it. */
export function parseDiagnosisResponse(text: string): DiagnosisResult {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response did not contain a JSON object.');

  const parsed = JSON.parse(match[0]);

  if (typeof parsed.dtc !== 'string' || typeof parsed.explanation !== 'string') {
    throw new Error('AI response was missing required diagnosis fields.');
  }

  return parsed as DiagnosisResult;
}
