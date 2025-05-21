import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { AIService, AIContext } from '@/lib/services/ai/textToBill';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body
        const body = await req.json();
        const { text, userCurrency, userLanguage, userTags, userLocations, localTime } = body;

        if (!text) {
            return NextResponse.json({
                error: 'Missing text input'
            }, { status: 400 });
        }

        // Prepare context
        const context: AIContext = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userCurrency: userCurrency || 'USD',
            userLanguage: userLanguage || 'en',
            userTags: userTags || [],
            userLocations: userLocations || [],
            localTime: localTime || new Date().toISOString(),
        };

        try {
            const aiService = new AIService();
            const transaction = await aiService.recognizeBill(text, context);

            return NextResponse.json({
                success: true,
                result: transaction
            });
        } catch (error) {
            console.error('Error in bill generation:', error);
            return NextResponse.json({
                error: 'Failed to generate bill data',
                details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in textToBill API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}