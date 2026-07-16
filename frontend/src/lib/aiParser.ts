interface AiParserOptions {
  transcript: string;
  hotwords: string;
  categories: string;
  entities: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPromptTemplate: string;
}

export interface AiParsedResult {
  amount: number;
  type: 'expense' | 'income';
  category: string;
  entityId: string | null;
  note: string;
  timestamp?: string;
}

export async function parseTransactionWithAi(options: AiParserOptions): Promise<AiParsedResult> {
  const { transcript, hotwords, categories, entities, apiKey, baseUrl, model, systemPromptTemplate } = options;

  if (!apiKey) {
    throw new Error('API Key is missing. Please configure it in the Setup page.');
  }

  // Inject variables into prompt
  let prompt = systemPromptTemplate;
  prompt = prompt.replace(/\{\{TRANSCRIPT\}\}/g, transcript);
  prompt = prompt.replace(/\{\{HOTWORDS\}\}/g, hotwords);
  prompt = prompt.replace(/\{\{CATEGORIES\}\}/g, categories);
  prompt = prompt.replace(/\{\{ENTITIES\}\}/g, entities);

  // Generate current local time with offset
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  // Local ISO string with timezone info, e.g. "2026-07-14T18:41:44-04:00"
  // Note: we can format it nicely to avoid messy Date math, or just use a standard readable string:
  const tzOffsetHours = Math.floor(now.getTimezoneOffset() / 60);
  const tzOffsetMinutes = Math.abs(now.getTimezoneOffset() % 60);
  const tzSign = tzOffsetHours > 0 ? '-' : '+';
  const localTimeStr = new Date(Date.now() - tzOffsetMs).toISOString().slice(0, 19) + 
                       `${tzSign}${String(Math.abs(tzOffsetHours)).padStart(2, '0')}:${String(tzOffsetMinutes).padStart(2, '0')}`;
  
  prompt = prompt.replace(/\{\{CURRENT_TIME\}\}/g, localTimeStr);

  // Hard inject critical rule to ensure AI always outputs timestamp regardless of user's custom prompt
  prompt += `\n\nCRITICAL INSTRUCTION:
The current local date and time is ${localTimeStr}.
If the user mentions a relative time (like "yesterday", "last Friday"), you MUST calculate the actual date based on the current time and return it in ISO-8601 format with timezone offset in the 'timestamp' JSON field (e.g. "2026-07-13T20:00:00-04:00").
If no time is mentioned, use the exact current time provided above.
Your response MUST be valid JSON matching this schema:
{
  "amount": number,
  "type": "expense" | "income",
  "category": string,
  "entityId": string | null,
  "note": string,
  "timestamp": string (ISO-8601 with offset)
}`;

  // DeepSeek / OpenAI compatible API endpoint
  const endpoint = baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;

  const payload = {
    model: model || 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: transcript
      }
    ],
    temperature: 0.1, // low temp for deterministic JSON extraction
    response_format: { type: 'json_object' } // Ensure JSON output if supported by model
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Invalid response from AI provider.');
  }

  try {
    // Attempt to parse the JSON block. 
    // Models sometimes wrap JSON in markdown block even with JSON mode enabled, so we clean it.
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleanContent) as AiParsedResult;
    
    // Basic validation
    if (typeof parsed.amount !== 'number' || isNaN(parsed.amount)) {
      throw new Error('AI returned an invalid amount.');
    }
    if (parsed.type !== 'expense' && parsed.type !== 'income') {
      parsed.type = 'expense'; // default fallback
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse AI output:', content);
    throw new Error('AI failed to return valid JSON format.');
  }
}
