'use client';

import { FormEvent, useEffect, useState, useRef } from 'react';
import { Mic, Loader, Check, X, ArrowUpFromLine, RefreshCcw } from 'lucide-react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils"

import { Transaction, EditableTransaction } from '@/models/transaction';
import { ConfirmBillCard } from './BillCard';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';

export interface PopupAudioProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * Response type for transaction transcription
 */
export type TransactionResponse = {
    success: boolean;
    result: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        subcategory?: string;
        timestamp: string; // ISO string format
        note?: string;
        currency?: string;
        location?: string;
        tags?: string[];
        emoji?: string;
    };
};

export default function PopupAudio({ open, onOpenChange }: PopupAudioProps) {
    const { user } = useUserStore();
    const [recordState, setRecordState] = useState<'idle' | 'recording' | 'uploading' | 'finished'>('idle');
    const [volume, setVolume] = useState<number>(0);
    const [buttonEnabled, setButtonEnabled] = useState(true);
    const [transactionCards, setTransactionCards] = useState<EditableTransaction[]>([]);

    // refs to hold recording state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafIdRef = useRef<number>(0);
    const startTime = useRef<number>(0);

    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open]);

    // reset state when the component unmounts
    const resetState = () => {
        setRecordState('idle');
        setTransactionCards([]);
        setVolume(0);
        startTime.current = 0;
        audioChunksRef.current = [];

        // Stop the media recorder if it's active
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Release stream tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        mediaRecorderRef.current = null;
        streamRef.current = null;
        analyserRef.current = null;
        cancelAnimationFrame(rafIdRef.current);
    }

    // Update volume (RMS) and loop the call
    const updateVolume = () => {
        const analyser = analyserRef.current;
        if (analyser) {
            const buffer = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
                const v = (buffer[i] - 128) / 128;
                sum += v * v;
            }
            const rms = Math.sqrt(sum / buffer.length);
            setVolume(rms);
        }
        rafIdRef.current = requestAnimationFrame(updateVolume);
    };

    const handleRecordStateChange = async () => {
        switch (recordState) {
            case 'idle':
                // Start recording
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    const recorder = new MediaRecorder(stream);
                    mediaRecorderRef.current = recorder;
                    audioChunksRef.current = [];
                    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                    recorder.start();
                    setRecordState('recording');
                    startTime.current = Date.now();

                    // Set up Web Audio analyzer
                    const audioCtx = new AudioContext();
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    analyserRef.current = analyser;
                    updateVolume();
                } catch (err) {
                    console.error('Unable to get microphone permission', err);
                }
                break;
            case 'recording':
                // Stop recording and immediately start uploading
                setButtonEnabled(false);
                setRecordState('uploading');

                // Stop recording and release stream
                mediaRecorderRef.current?.stop();
                streamRef.current?.getTracks().forEach((track) => track.stop());
                cancelAnimationFrame(rafIdRef.current);

                // Wait for the last chunk of audio data
                await new Promise<void>((resolve) => {
                    if (mediaRecorderRef.current) {
                        mediaRecorderRef.current.onstop = () => resolve();
                    } else {
                        resolve();
                    }
                });

                // Upload the recording
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: blob.type });
                const form = new FormData();
                form.append('file', file);
                form.append('localTime', new Date().toISOString());
                form.append('userCurrency', user?.currency || 'USD');
                form.append('userLanguage', user?.language || 'en');
                form.append('userTags', JSON.stringify(user?.tags.map((tag) => tag.name) || []));
                form.append('userLocations', JSON.stringify(user?.locations.map((location) => location.name) || []));

                try {
                    const res = await fetch('/api/app/ai/audioToBill', {
                        method: 'POST',
                        body: form,
                    });

                    if (!res.ok) {
                        throw new Error(`API error: ${res.statusText}`);
                    }

                    const data: TransactionResponse = await res.json();
                    console.log('data:', data);

                    const transactions = Array.isArray(data.result)
                        ? data.result
                        : [data.result];

                    const transactionCards = transactions.map((transaction) => ({
                        amount: transaction.amount,
                        type: transaction.type,
                        category: transaction.category,
                        subcategory: transaction.subcategory,
                        timestamp: new Date(transaction.timestamp),
                        note: transaction.note,
                        currency: transaction.currency,
                        tags: transaction.tags,
                        location: transaction.location,
                        emoji: transaction.emoji,
                    }));

                    setTransactionCards(transactionCards);
                    console.log('Transactions:', transactions);
                } catch (err) {
                    console.error('Upload failed', err);
                } finally {
                    setButtonEnabled(true);
                    setRecordState('finished');
                }
                break;
            case 'finished':
                // Reset state
                resetState();
                break;
        }
    };

    // Render circle size based on volume, minimum 20px, maximum 100px
    const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
    const smoothedVolume = volumeHistory.reduce((sum, v) => sum + v, 0) / volumeHistory.length || 0;

    useEffect(() => {
        setVolumeHistory((prev) => {
            const updated = [...prev, volume];
            if (updated.length > 10) updated.shift(); // Keep the last 10 values
            return updated;
        });
    }, [volume]);

    const circleSize = 200 + Math.min(Math.max(smoothedVolume, 0), 1) * 500;

    // Add function to handle card removal
    const handleCardRemoval = (index: number) => {
        setTransactionCards(prev => {
            const newCards = prev.filter((_, idx) => idx !== index);
            // If this was the last card and we're in finished state, close the drawer
            if (newCards.length === 0 && recordState === 'finished') {
                onOpenChange?.(false);
            }
            return newCards;
        });
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>

            </DrawerTrigger>
            <DrawerContent className="p-6 w-full h-full">
                <DrawerHeader>
                    <DrawerTitle className="flex justify-center gap-2 text-gray-500">
                        <p className={cn(
                            "text-center transition-color duration-200",
                            recordState === 'idle' ? "text-gray-500" :
                                recordState === 'recording' ? "text-red-500" :
                                    recordState === 'uploading' ? "text-blue-500" :
                                        recordState === 'finished' ? "text-green-500" : ""
                        )}>
                            {recordState === 'idle' ? "Tap the button below to start." :
                                recordState === 'recording' ? "Recording... Speak now!" :
                                    recordState === 'uploading' ? "Processing your recording..." :
                                        recordState === 'finished' ? "Identified transaction" : ""}
                        </p>
                    </DrawerTitle>
                </DrawerHeader>
                <div className='flex flex-col h-full items-center'>
                    {/* Recording visualization or transcription results */}
                    <div className="h-full w-full mb-6 flex flex-col items-center">
                        {recordState !== 'finished' && (
                            <div className='h-[50%] w-full flex flex-col items-center justify-center'>
                                <div className="fixed top-26 text-gray-500">
                                    {(recordState === 'recording' || recordState === 'uploading') && (
                                        <p
                                            className={cn(
                                                "text-3xl font-bold transition-colors duration-500",
                                                recordState === 'recording' ? "text-red-500" : "text-gray-700"
                                            )}
                                        >
                                            {Math.floor((Date.now() - startTime.current) / 1000)}s
                                        </p>
                                    )}
                                </div>
                                <div className='fixed h-[50%] w-full flex justify-center items-center top-32 pointer-events-none'>
                                    <div className="relative flex items-center justify-center">
                                        {/* Pulsing background circles */}
                                        <div className={cn(
                                            "absolute rounded-full opacity-10 animate-pulse",
                                            recordState === 'recording' ? "bg-indigo-400" : "bg-gray-400"
                                        )}
                                            style={{
                                                width: `${circleSize * 1.4}px`,
                                                height: `${circleSize * 1.4}px`,
                                                // transition: 'all 0.5s ease-in-out'
                                            }}
                                        />
                                        <div className={cn(
                                            "absolute rounded-full opacity-20 animate-pulse",
                                            recordState === 'recording' ? "bg-indigo-500" : "bg-gray-500"
                                        )}
                                            style={{
                                                width: `${circleSize * 1.2}px`,
                                                height: `${circleSize * 1.2}px`,
                                                animationDelay: '0.3s',

                                            }}
                                        />

                                        {/* Main circle with gradient */}
                                        <div
                                            className={cn(
                                                "rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out",
                                                recordState === 'idle' ? "bg-gradient-to-r from-indigo-300 to-blue-300 opacity-60" :
                                                    recordState === 'recording' ? "bg-gradient-to-r from-indigo-500 to-violet-500 opacity-80" :
                                                        recordState === 'uploading' ? "bg-gradient-to-r from-blue-400 to-indigo-400 opacity-70" : ""
                                            )}
                                            style={{
                                                width: `${circleSize}px`,
                                                height: `${circleSize}px`,
                                                transform: recordState === 'recording' ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        >
                                            {/* {recordState === 'recording' && (
                                                <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {recordState === 'finished' && (
                            <ScrollArea className="h-auto max-h-[70%] w-full flex flex-col">
                                {transactionCards.length > 0 ? (
                                    transactionCards.map((transactionCard, index) => (
                                        <ConfirmBillCard
                                            key={index}
                                            transaction={transactionCard}
                                            onSuccess={() => handleCardRemoval(index)}
                                            onCancel={() => handleCardRemoval(index)}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg my-4 text-center">
                                        <X size={48} className="text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700">
                                            No transactions found
                                        </h3>
                                        <p className="text-gray-500 mt-2">
                                            We couldn't identify any transactions from your recording.
                                            Try again with a clearer description.
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        )}
                    </div>

                    {/* Control buttons */}
                    <div className='flex justify-evenly w-full fixed bottom-6 left-0 right-0 px-4'>
                        {/* Cancel button */}
                        <button
                            onClick={() => onOpenChange?.(false)}
                            className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center border-4 border-black"
                        >
                            <X size={32} />
                        </button>

                        {/* Action button - changes based on recording state */}
                        <button
                            disabled={!buttonEnabled}
                            onClick={handleRecordStateChange}
                            className={cn(
                                'w-24 h-24 rounded-full text-white flex items-center justify-center transition-all duration-300 ease-in-out transform',
                                !buttonEnabled ? 'bg-gray-400 scale-100' :
                                    recordState === 'idle' ? 'bg-teal-500 scale-100' :
                                        recordState === 'recording' ? 'bg-red-500 scale-110' : 'bg-black scale-100'
                            )}
                        >
                            {recordState === 'idle' && <Mic size={32} />}
                            {recordState === 'recording' && <Check size={32} />}
                            {recordState === 'uploading' && <Loader className="animate-spin" />}
                            {recordState === 'finished' && <RefreshCcw size={32} />}
                        </button>
                    </div>
                </div>

            </DrawerContent>
        </Drawer>
    );
}

