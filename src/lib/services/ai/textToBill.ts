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
            Extract financial transaction information from the input text and return it in this JSON schema:

            Transaction = {
                amount: number,                // numeric amount of the transaction, default to 0
                type: "income" | "expense", 
                category: string,              // You must choose from the categories I give to you
                timestamp: string,             // ISO 8601 date-time (default to current time if not provided)
                note: string,                 // extra details, use objective, factual description instead, in user's language
                currency: string,             //  currency mentions in text, default to "${context.userCurrency}"
                location?: string,             // optional, location of transaction
                emoji: string,                 // ONE emoji representing the transaction
                tags: string[]               // relevant tags from user's tag list
            }

            Information you can rely on:
            Current time: ${context.localTime}
            User preferences:
            - Default currency: ${context.userCurrency}
            - Language: ${context.userLanguage}
            - tags: ${context.userTags}
            - locations: ${context.userLocations}

            Categories:
            - Income categories: ${main_income_categories.join(', ')}
            - Expense categories: ${main_expense_categories.join(', ')}
            
            Transaction details:
            Text: ${text}
            
            If found return: {
                found: true,
                transaction: Transaction
            }
            If no transaction information is found in the input text, return: {
                found: false,
                transaction: null
            }
        `;
    }

    async recognizeBill(text: string, context: AIContext): Promise<Transaction | null> {
        try {
            const prompt = this.buildPrompt(context, text);
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

            if (!parsed.found || !parsed.transaction) {
                return null;
            }

            return parsed.transaction;
        } catch (error) {
            console.error('AI recognition error:', error);
            throw error;
        }
    }
} 