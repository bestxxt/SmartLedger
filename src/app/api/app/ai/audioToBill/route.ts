import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { Transaction } from '@/types/transaction';
import { checkAuth } from '@/lib/auth';
import { main_income_categories, main_expense_categories, sub_expense_categories } from '@/lib/constants';
// 音频转写服务的URL (same as in transcribe API)
const TRANSCRIPTION_SERVICE_URL = 'http://10.0.0.45:8000/transcribe_sync';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const user = await checkAuth();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Step 1: Get form data with audio file
        let formData;
        try {
            formData = await req.formData();
        } catch (error) {
            console.error('Error parsing form data:', error);
            return NextResponse.json({
                error: 'Invalid or missing form data'
            }, { status: 400 });
        }

        // Check if file exists
        if (!formData.has('file')) {
            return NextResponse.json({
                error: 'Missing audio file'
            }, { status: 400 });
        }

        // Step 2: Transcribe the audio
        let transcriptionText;
        try {
            // Forward request to audio transcription service
            const transcriptionResponse = await fetch(TRANSCRIPTION_SERVICE_URL, {
                method: 'POST',
                body: formData,
            });

            if (!transcriptionResponse.ok) {
                throw new Error(`Transcription service responded with status: ${transcriptionResponse.status}`);
            }

            // Parse the transcription result
            const transcriptionResult = await transcriptionResponse.json();

            // Extract the text from the response
            if (transcriptionResult.text) {
                // Simple text response from some API versions
                transcriptionText = transcriptionResult.text;
            } else if (transcriptionResult.segments) {
                // Response with segments from other API versions
                transcriptionText = transcriptionResult.segments.map((segment: any) => segment.text).join(' ');
            } else {
                throw new Error('Invalid transcription response format');
            }

        } catch (error) {
            console.error('Error during audio transcription:', error);
            return NextResponse.json({
                error: 'Failed to transcribe audio',
                details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }

        // Step 3: Generate bill data from the transcription using Gemini API
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { error: 'Gemini API key not configured' },
                    { status: 500 }
                );
            }

            // Initialize Google GenAI with API key
            const genAI = new GoogleGenAI({ apiKey });

            // Get the gemini model
            const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

            // Prepare the prompt
            const prompt = `
                Extract financial transaction information from the input text and return it in this JSON schema:

                Transaction[] = {
                    amount: number,                // numeric amount of the transaction, default to 0
                    type: "income" | "expense",    // type of transaction
                    category: string,              // You must choose from the following categories:
                        income: ${main_income_categories.join(', ')};
                        expense: ${main_expense_categories.join(', ')}.
                    subcategory?: string,          
                        expense: ${sub_expense_categories.join(', ')}.
                    timestamp: string,             // ISO 8601 date-time (default to current date if not provided)
                    note: string,                 // extra details, use objective, factual description instead.
                    currency?: string,             // optional, default to "USD"
                    location?: string,             // optional, location of transaction in text's language
                    emoji: string                  //  emoji representing the transaction
                }

                Information you can rely on:
                Current time: ${new Date().toISOString()}

                Transaction details:
                Text: ${transcriptionText}
                
                If found return: {
                    found: true,
                    transaction: Transaction
                }
                If no transaction information is found in the input text, return: {
                    found: false,
                    transaction: null
                }
            `;
            // console.log('Prompt:', prompt);

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
                return NextResponse.json({
                    error: 'Failed to parse AI response',
                    transcription: transcriptionText
                }, { status: 500 });
            }

            // Return both the transcription and the transaction data
            return NextResponse.json({
                success: true,
                transcription: transcriptionText,
                result: parsed
            });

        } catch (error) {
            console.error('Error in bill generation:', error);
            return NextResponse.json({
                error: 'Failed to generate bill data',
                transcription: transcriptionText
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in audioToBill API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}