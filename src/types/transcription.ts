// Updated interface to match the new response format
export interface TranscriptionSegment {
    start: number;
    end: number;
    text: string;
}

export interface TranscriptionResult {
    language: string;
    language_probability: number;
    segments: TranscriptionSegment[];
}
