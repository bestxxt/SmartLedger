import type { Transaction } from '@/models/transaction';
import { GoogleGenAI } from '@google/genai';
import { main_income_categories, main_expense_categories } from '@/lib/constants';

export interface AIContext {
    timezone: string;
    userCurrency: string;
    userLanguage: string;
    userTags: { name: string }[];
    userLocations: { name: string }[];
    localTime: string;
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

    private buildPrompt(context: AIContext, text: string): string {
        return `
            Objective: 
                Extract financial transaction information from the input text and return it in this JSON schema:

            Input:
                - Text: ${text}

            Context:
                - Current time: ${context.localTime}
                - currency: ${context.userCurrency}
                - tags: ${context.userTags}
                - locations: ${context.userLocations}

            Categories:
                - ${main_income_categories.join(', ') + ', ' + main_expense_categories.join(', ')}

            Output Format:
            {
                "found": true,
                "transactions": [
                    {
                        "amount": number,                             // Default: 0 if not found
                        "type": "income" | "expense", 
                        "category": string,                           // Must match given categories
                        "timestamp": string,                          // ISO 8601 (default: context.localTime)
                        "note": string,                               // Brief factual summary in ${context.userLanguage},Use objective and factual language.
                        "currency": string,                           // Currency mentioned in Text else context.currency
                        "location": string (optional),                // Match from context.locations
                        "emoji": string,                              // One emoji best representing the transaction
                        "tags": string[]                              // Relevant from context.tags
                    }
                ]
            }
            If no transaction is detected, return:
            {
                "found": false,
                "transactions": []
            }
        `;
    }

    async recognizeBill(text: string, context: AIContext): Promise<Transaction[] | null> {
        try {
            const prompt = this.buildPrompt(context, text);
            // console.log('AI prompt:', prompt);
            const response = await this.genAI.models.generateContent({
                model: this.model,
                contents: prompt,
            });

            const textContent = response.text;
            if (!textContent) {
                throw new Error('AI response is undefined or empty');
            }

            const cleaned = textContent
                .replace(/```json\s*/, '')
                .replace(/```/, '')
                .trim();

            const parsed = JSON.parse(cleaned);
            // console.log('Parsed transaction:', parsed);
            if (!parsed.found) {
                return null;
            }
            return parsed.transactions;
        } catch (error) {
            console.error('AI recognition error:', error);
            throw error;
        }
    }
} 