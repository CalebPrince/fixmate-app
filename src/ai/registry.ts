import { AiProvider, AiProviderId } from './AiProvider';
import { openAiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { geminiProvider } from './providers/gemini';
import { xaiProvider } from './providers/xai';

export const AI_PROVIDERS: Record<AiProviderId, AiProvider> = {
  openai: openAiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  xai: xaiProvider,
};

export const AI_PROVIDER_ORDER: AiProviderId[] = ['openai', 'anthropic', 'gemini', 'xai'];
