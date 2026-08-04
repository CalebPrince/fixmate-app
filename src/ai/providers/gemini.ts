import { AiProvider } from '../AiProvider';
import { SYSTEM_PROMPT, buildUserPrompt, parseDiagnosisResponse } from '../prompt';

const MODEL = 'gemini-3-flash';

export const geminiProvider: AiProvider = {
  id: 'gemini',
  label: 'Google',
  modelLabel: `Gemini · 3 flash`,
  keyPlaceholder: 'AIza··········',

  async diagnose(input, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(input) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini request failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini response had no content.');
    return parseDiagnosisResponse(text);
  },
};
