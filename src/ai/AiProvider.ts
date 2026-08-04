import { DiagnosisInput, DiagnosisResult } from '../types/diagnosis';

export type AiProviderId = 'openai' | 'anthropic' | 'gemini' | 'xai';

export interface AiProvider {
  id: AiProviderId;
  label: string;
  modelLabel: string;
  keyPlaceholder: string;
  diagnose(input: DiagnosisInput, apiKey: string): Promise<DiagnosisResult>;
}
