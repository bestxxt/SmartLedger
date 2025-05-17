import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { AIService } from '@/lib/services/ai';

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

        // Get timezone from form data or use UTC as fallback
        const timezone = formData.get('timezone')?.toString() || 'UTC';
        // Get user preferences
        const userCurrency = formData.get('userCurrency')?.toString() || 'USD';
        const userLanguage = formData.get('userLanguage')?.toString() || 'en';
        const userTags = JSON.parse(formData.get('userTags')?.toString() || '[]');
        const userLocations = JSON.parse(formData.get('userLocations')?.toString() || '[]');

        const imageFile = formData.get('file') as File;
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Initialize AI service
        const aiService = new AIService();

        // Prepare context for AI
        const context = {
            timezone,
            userCurrency,
            userLanguage,
            userTags,
            userLocations
        };

        // Recognize bill from image
        const transaction = await aiService.recognizeBill(base64, imageFile.type, context);

        if (!transaction) {
            return NextResponse.json({ 
                success: false,
                error: 'No transaction information found in the image' 
            });
        }

        return NextResponse.json({ 
            success: true, 
            result: transaction 
        });
    } catch (error) {
        console.error('Error in pictureToBill API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}