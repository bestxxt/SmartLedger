import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { main_income_categories, main_expense_categories, sub_expense_categories } from '@/lib/constants';
import type { Transaction } from '@/types/transaction';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let formData;
        try {
            formData = await req.formData();
        } catch (err) {
            return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
        }

        if (!formData.has('file')) {
            return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
        }

        // Get local time from form data or use current time as fallback
        const localTime = formData.get('localTime')?.toString() || new Date().toISOString();
        // Get user preferences
        const userCurrency = formData.get('userCurrency')?.toString() || 'USD';
        const userLanguage = formData.get('userLanguage')?.toString() || 'en';
        const userTags = JSON.parse(formData.get('userTags')?.toString() || '[]');
        const userLocations = JSON.parse(formData.get('userLocations')?.toString() || '[]');

        const imageFile = formData.get('file') as File;
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }
        const genAI = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        const prompt = `
                Extract financial transaction information from the image and return it in this JSON schema:

                Transaction[] = {
                    amount: number,                // numeric amount of the transaction, default to 0
                    type: "income" | "expense", 
                    category: string,              // You must choose from the categories I give to you
                    subcategory?: string,           // You must choose from the subcategory I give to you
                    timestamp: string,             // ISO 8601 date-time (default to current time if not provided)
                    note: string,                 // extra details, use objective, factual description instead.
                    currency: string,             //  default to "${userCurrency}"
                    location?: string,             // optional, location of transaction in text's language
                    emoji: string,                 //  emoji representing the transaction
                    tags?: string[]               // optional, relevant tags from user's tag list
                }

                Information you can rely on:
                Current time: ${localTime}
                User preferences:
                - Default currency: ${userCurrency}
                - Language: ${userLanguage}
                - Common tags: ${userTags.join(', ')}
                - Common locations: ${userLocations.join(', ')}

                Categories:
                - Income categories: ${main_income_categories.join(', ')}
                - Expense categories: ${main_expense_categories.join(', ')}
                - Expense subcategories: ${sub_expense_categories.join(', ')}
                
                If found return: {
                    found: true,
                    transaction: Transaction[]
                }
                If no transaction information is found in the image, return: {
                    found: false,
                    transaction: null
                }
            `;

        const contents = [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64,
                },
            },
            { text: prompt },
        ];

        const response = await genAI.models.generateContent({ model, contents });
        const text = response.text;
        if (!text) throw new Error('Empty AI response');

        const cleaned = text.replace(/```json\s*/, '').replace(/```/, '').trim();
        let parsed: Transaction;
        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json({ success: true, result: parsed });
    } catch (error) {
        console.error('Error in pictureToBill API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}