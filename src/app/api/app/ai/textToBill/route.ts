import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { main_income_categories, main_expense_categories, sub_expense_categories } from '@/lib/constants';
import type { Transaction } from '@/models/transaction';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, timezone = 'UTC' } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

        // Prepare the prompt
        const prompt = `
        Extract financial transaction information from the input text and return it in this JSON schema:

        Transaction[] = {
            amount: number,                // numeric amount of the transaction, default to 0
            type: "income" | "expense",    // type of transaction
            category: string,              // general category of the transaction
            subcategory?: string,          // optional, more specific category
            timestamp: string,             // date-time in UTC format (ISO 8601), convert any local time found in text to UTC
            note: string,                 // extra details in text's language
            currency?: string,             // optional, default to "USD"
            tags?: string[],               // optional, list of related tags in text's language
            location?: string,             // optional, location of transaction in text's language
            emoji: string                  //  emoji representing the transaction
        }

        Information you can rely on:
        User timezone: ${timezone}

        Important timezone rules:
        1. If you find a time in the text, convert it to UTC using the user's timezone (${timezone})
        2. If no time is found in the text, use the current UTC time
        3. Always return the timestamp in UTC format (ISO 8601)

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

        // Generate content
        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
        });
        const textContent = response.text;
        if (!textContent) {
            throw new Error('AI response is undefined or empty');
        }

        const cleaned = response.text
            .replace(/```json\s*/, '')
            .replace(/```/, '')
            .trim();

        let parsed: Transaction;

        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            result: parsed
        });

    } catch (error) {
        console.error('Error in textToBill API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}