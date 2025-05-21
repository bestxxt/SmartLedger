import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { AIService, AIContext } from '@/lib/services/ai/audioToBill';

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Step 1: Get form data with audio file and optional parameters
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

        // Get user preferences
        const context: AIContext = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            userCurrency: formData.get('userCurrency')?.toString() || 'USD',
            userLanguage: formData.get('userLanguage')?.toString() || 'en',
            userTags: JSON.parse(formData.get('userTags')?.toString() || '[]'),
            userLocations: JSON.parse(formData.get('userLocations')?.toString() || '[]'),
            localTime: formData.get('localTime')?.toString() || new Date().toISOString(),
        };

        try {
            const aiService = new AIService();
            const transaction = await aiService.recognizeBill(formData, context);

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
        console.error('Error in audioToBill API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}