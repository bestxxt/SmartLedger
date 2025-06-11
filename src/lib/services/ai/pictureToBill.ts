import { GoogleGenAI } from '@google/genai';
import { main_income_categories, main_expense_categories } from '@/lib/constants';
import type { Transaction } from '@/models/transaction';

export interface AIContext {
    timezone: string;
    userCurrency: string;
    userLanguage: string;
    userTags: { name: string }[];
    userLocations: { name: string }[];
}

export class AIService {
    private genAI: GoogleGenAI;
    private model: string;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }
        this.genAI = new GoogleGenAI({ apiKey });
        this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    }

    private buildPrompt(context: AIContext): string {

        return `
            Extract financial transaction information from the images and return it in this JSON schema:

            Context:
                - CurrentTime: ${new Date().toISOString()}
                - currency: ${context.userCurrency}
                - tags: ${context.userTags}
                - locations: ${context.userLocations}

            Categories:
                - ${main_income_categories.join(', ') + ', ' + main_expense_categories.join(', ')}

            Output Format:
            {
                "found": true,
                "transaction": 
                {
                    "amount": number,                             // Default: 0 if not found
                    "type": "income" | "expense", 
                    "category": string,                           // Must match given categories
                    "timestamp": string,                          // using context.CurrentTime
                    "note": string,                               // Brief factual summary in ${context.userLanguage},Use objective and factual language.
                    "currency": string,                           // Currency mentioned in Text else context.currency
                    "location": string (optional),                // Match from context.locations
                    "emoji": string,                              // One emoji best representing the transaction
                    "tags": string[]                              // Relevant from context.tags
                }
            }
            If no transaction is detected, return:
            {
                "found": false,
                "transaction": {}
            }
        `;
    }

    async recognizeBill(imageData: string, mimeType: string, context: AIContext): Promise<Transaction | null> {
        try {
            const contents = [
                {
                    inlineData: {
                        mimeType,
                        data: imageData,
                    },
                },
                { text: this.buildPrompt(context) },
            ];
            // console.log('AI request contents:', contents[1].text);

            const response = await this.genAI.models.generateContent({ model: this.model, contents });
            const text = response.text;
            if (!text) throw new Error('Empty AI response');
            
            const cleaned = text.replace(/```json\s*/, '').replace(/```/, '').trim();
            const parsed = JSON.parse(cleaned);
            
            // console.log(parsed);
            if (!parsed.found) {
                return null;
            }

            return parsed.transaction;
        } catch (error) {
            console.error('AI recognition error:', error);
            throw error;
        }
    }
} 