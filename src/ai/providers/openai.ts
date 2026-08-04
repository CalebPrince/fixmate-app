import { AiProvider } from '../AiProvider';
import { SYSTEM_PROMPT, buildUserPrompt, parseDiagnosisResponse } from '../prompt';

const MODEL = 'gpt-4.1';

export const openAiProvider: AiProvider = {
  id: 'openai',
  label: 'OpenAI',
  modelLabel: `GPT · ${MODEL}`,
  keyPlaceholder: 'sk-proj-··········',

  async diagnose(input, apiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
      throw new Error(`OpenAI request failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI response had no content.');
    return parseDiagnosisResponse(text);
  },
};
