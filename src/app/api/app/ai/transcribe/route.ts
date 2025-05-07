import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { TranscriptionResult } from '@/types/transcription';

// 音频转写服务的URL
const TRANSCRIPTION_SERVICE_URL = 'http://10.0.0.45:8000/transcribe_sync';

export async function POST(req: NextRequest) {
    try {
        // 检查用户身份认证
        const user = await checkAuth();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 从请求中获取表单数据
        let formData;
        try {
            formData = await req.formData();
        } catch (error) {
            console.error('Error parsing form data:', error);
            return NextResponse.json({ 
                error: 'Invalid or missing form data' 
            }, { status: 400 });
        }
        
        // 检查是否包含音频文件
        if (!formData.has('file')) {
            return NextResponse.json({ 
                error: 'Missing file' 
            }, { status: 400 });
        }

        try {
            // 转发请求到音频转写服务
            const response = await fetch(TRANSCRIPTION_SERVICE_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Transcription service responded with status: ${response.status}`);
            }
            
            // 返回转写结果给客户端
            return response;
        } catch (error) {
            console.error('Error while calling transcription service:', error);
            return NextResponse.json({
                error: 'Failed to transcribe audio',
                details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in transcribe API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}