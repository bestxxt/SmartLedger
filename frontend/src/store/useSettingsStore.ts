import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const DEFAULT_SYSTEM_PROMPT = `You are a financial extraction AI.
Extract the transaction details from the user's transcript.

<HOTWORDS>
{{HOTWORDS}}
</HOTWORDS>

<CATEGORIES>
{{CATEGORIES}}
</CATEGORIES>

<ENTITIES>
{{ENTITIES}}
</ENTITIES>

Based on the transcript, return a strictly valid JSON object with the following schema:
{
  "amount": number (the transaction amount, positive number),
  "type": "expense" | "income" (infer if they spent money or received money),
  "category": string (MUST be exactly one of the exact names from the <CATEGORIES> list),
  "entityId": string | null (If the transaction is heavily related to one of the <ENTITIES>, return its 'id'. Use your hotwords to denoise if they used a nickname. Otherwise return null),
  "note": string (A brief note summarizing the transaction)
}

Respond ONLY with the JSON object. Do not include markdown formatting like \`\`\`json.`;

export interface SettingsState {
  aiProvider: string;
  aiBaseUrl: string;
  aiApiKey: string;
  aiModel: string;
  systemPromptTemplate: string;
  
  setAiConfig: (config: Partial<Omit<SettingsState, 'setAiConfig'>>) => void;
  resetToDefaultPrompt: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiProvider: 'DeepSeek',
      aiBaseUrl: 'https://api.deepseek.com/v1',
      aiApiKey: '',
      aiModel: 'deepseek-chat',
      systemPromptTemplate: DEFAULT_SYSTEM_PROMPT,
      
      setAiConfig: (config) => set((state) => ({ ...state, ...config })),
      resetToDefaultPrompt: () => set({ systemPromptTemplate: DEFAULT_SYSTEM_PROMPT })
    }),
    {
      name: 'smartledger-settings-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
