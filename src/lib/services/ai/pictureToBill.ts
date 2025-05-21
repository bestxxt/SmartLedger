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
            Extract financial transaction information from the image and return it in this JSON schema:

            Transaction = {
                amount: number,                // numeric amount of the transaction, default to 0
                type: "income" | "expense", 
                category: string,              // You must choose from the categories I give to you
                timestamp: string,             // If content have date, use it(don't change it), otherwise use current time
                note: string,                 // extra details, use objective, factual description instead, in user's language
                currency: string,             //  default to "${context.userCurrency}"
                emoji: string,                 // one emoji representing the transaction
                location?: string,             // optional, relevant location from user's location list
                tags: string[]               // optional, relevant tags from user's tag list
            }

            Information you can rely on:
            current time: ${new Date().toISOString()}
            User preferences:
            - Default currency: ${context.userCurrency}
            - Language: ${context.userLanguage}
            - tags: ${context.userTags}
            - locations: ${context.userLocations}

            Categories:
            - Income categories: ${main_income_categories.join(', ')}
            - Expense categories: ${main_expense_categories.join(', ')}
            
            If found return: {
                found: true,
                transaction: Transaction
            }
            If no transaction information is found in the image, return: {
                found: false,
                transaction: null
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