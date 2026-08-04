import { AiProvider } from '../AiProvider';
import { SYSTEM_PROMPT, buildUserPrompt, parseDiagnosisResponse } from '../prompt';

const MODEL = 'grok-4';

export const xaiProvider: AiProvider = {
  id: 'xai',
  label: 'xAI',
  modelLabel: `Grok · 4`,
  keyPlaceholder: 'xai-··········',

  async diagnose(input, apiKey) {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input) },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`xAI request failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error('xAI response had no content.');
    return parseDiagnosisResponse(text);
  },
};
