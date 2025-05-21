import type { Transaction } from '@/models/transaction';
import { AIService as TextToBillService, AIContext } from './textToBill';

export class AIService {
    private transcriptionServiceUrl: string;
    private textToBillService: TextToBillService;

    constructor() {
        this.transcriptionServiceUrl = process.env.TRANSCRIPTION_URL || 'https://api.example.com/transcribe';
        this.textToBillService = new TextToBillService();
    }

    private async transcribeAudio(formData: FormData): Promise<string> {
        try {
            const transcriptionResponse = await fetch(this.transcriptionServiceUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-API-Key': process.env.TRANSCRIPTION_API_KEY || ''
                }
            });

            if (!transcriptionResponse.ok) {
                throw new Error(`Transcription service responded with status: ${transcriptionResponse.status}`);
            }

            const transcriptionResult = await transcriptionResponse.json();

            if (transcriptionResult.segments) {
                return transcriptionResult.segments.map((segment: any) => segment.text).join(' ');
            } else {
                throw new Error('Invalid transcription response format');
            }
        } catch (error) {
            console.error('Error during audio transcription:', error);
            throw error;
        }
    }

    async recognizeBill(formData: FormData, context: AIContext): Promise<Transaction | null> {
        try {
            // Step 1: Transcribe the audio
            const transcriptionText = await this.transcribeAudio(formData);

            // Step 2: Use textToBill service to process the transcribed text
            return this.textToBillService.recognizeBill(transcriptionText, context);
        } catch (error) {
            console.error('AI recognition error:', error);
            throw error;
        }
    }
} 