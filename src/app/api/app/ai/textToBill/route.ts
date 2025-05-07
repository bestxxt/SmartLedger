import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { Transaction } from '@/types/transaction';
import { checkAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const user = await checkAuth();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid text parameter' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Initialize Google GenAI with API key
        const genAI = new GoogleGenAI({ apiKey });

        // Get the gemini-pro model
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

        // Prepare the prompt
        const prompt = `
        Extract financial transaction information from the input text and return it in this JSON schema:

        Transaction[] = {
            amount: number,                // numeric amount of the transaction, default to 0
            type: "income" | "expense",    // type of transaction
            category: string,              // general category of the transaction
            subcategory?: string,          // optional, more specific category
            timestamp: string,             // ISO 8601 date-time (default to current date if not provided)
            note: string,                 // extra details in text's language
            currency?: string,             // optional, default to "USD"
            tags?: string[],               // optional, list of related tags in text's language
            location?: string,             // optional, location of transaction in text's language
            emoji: string                  //  emoji representing the transaction
        }

        Information you can rely on:
        Current time: ${new Date().toISOString()}

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