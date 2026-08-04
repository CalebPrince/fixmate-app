import { AiProvider } from '../AiProvider';
import { SYSTEM_PROMPT, buildUserPrompt, parseDiagnosisResponse } from '../prompt';

const MODEL = 'claude-sonnet-4-5';

export const anthropicProvider: AiProvider = {
  id: 'anthropic',
  label: 'Anthropic',
  modelLabel: `Claude · sonnet`,
  keyPlaceholder: 'sk-ant-··········',

  async diagnose(input, apiKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(input) }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic request failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const text = json.content?.[0]?.text;
    if (!text) throw new Error('Anthropic response had no content.');
    return parseDiagnosisResponse(text);
  },
};
