// Create PopupPicture component similar to PopupAudio for selecting, previewing, uploading image
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Camera, ArrowUpFromLine, X, Loader, RefreshCcw } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmBillCard } from './BillCard';
import { EditableTransaction } from '@/types/transaction';

export interface PopupPictureProps {
    onSubmit?: (tx: EditableTransaction) => Promise<void>;
}

/**
 * Response type for transaction transcription
 */
export type TransactionResponse = {
    success: boolean;
    transcription: string;
    result: {
        found: boolean;
        transaction?: {
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
};


export default function PopupPicture({ onSubmit }: PopupPictureProps) {
    const [open, setOpen] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [state, setState] = useState<'idle' | 'selected' | 'uploading' | 'finished'>('idle');
    const [transactionCards, setTransactionCards] = useState<EditableTransaction[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setPhoto(null);
            setPreviewUrl(null);
            setState('idle');
            setTransactionCards([]);
        }
    }, [open]);

    useEffect(() => {
        if (photo) {
            const url = URL.createObjectURL(photo);
            setPreviewUrl(url);
        }
    }, [photo]);

    const handleFileChange = (e: FormEvent<HTMLInputElement>) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files[0]) {
            setPhoto(files[0]);
            setState('selected');
            setOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!photo) return;
        setState('uploading');
        const form = new FormData();
        form.append('file', photo);
        try {
            const res = await fetch('/api/app/ai/pictureToBill', { method: 'POST', body: form });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            if (!data.result.found) {
                setTransactionCards([]);
            } else {
                if (data.result.transaction) {
                    const txs = Array.isArray(data.result.transaction)
                        ? data.result.transaction
                        : [data.result.transaction];
                    setTransactionCards(
                        txs.map((tx: NonNullable<TransactionResponse['result']['transaction']>) => ({
                            amount: tx.amount,
                            type: tx.type,
                            category: tx.category,
                            subcategory: tx.subcategory,
                            timestamp: new Date(tx.timestamp),
                            note: tx.note,
                            currency: tx.currency,
                            tags: tx.tags || [],
                            location: tx.location,
                            emoji: tx.emoji,
                        }))
                    );
                } else {
                    setTransactionCards([]);
                }
            }
            setState('finished');
        } catch (err) {
            console.error(err);
            setState('finished');
        } finally {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            setPhoto(null);
        }
    };

    return (
        <>
            <input
                type="file"
                accept="image/*"
                // capture="environment"
                style={{ display: 'none' }}
                ref={inputRef}
                onChange={handleFileChange}
            />
            <button
                className="fixed bottom-42 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg"
                aria-label="Upload picture"
                onClick={() => inputRef.current?.click()}
            >
                <Camera />
            </button>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className="p-6 w-full h-full">
                    <div className="flex-1 flex flex-col items-center">
                        {state === 'selected' && previewUrl && (
                            <img src={previewUrl} alt="Preview" className="max-h-[70%] object-contain mb-4" />
                        )}
                        {state === 'uploading' && <Loader className="animate-spin text-gray-500 my-8" />}
                        {state === 'finished' && (
                            <ScrollArea className="h-auto max-h-[70%] w-full flex flex-col ">
                                {transactionCards.length > 0 ? (
                                    transactionCards.map((tx, i) => (
                                        <ConfirmBillCard
                                            key={i}
                                            transaction={tx}
                                            onConfirm={async confirmTx => {
                                                if (onSubmit) await onSubmit(confirmTx);
                                            }}
                                            onSuccess={() =>
                                                setTransactionCards(prev => prev.filter((_, idx) => idx !== i))
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg my-4 text-center">
                                        <X size={48} className="text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700">No transactions found</h3>
                                        <p className="text-gray-500 mt-2">
                                            We couldn't identify any transactions. Try another photo.
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        )}
                    </div>
                    <div className="flex justify-evenly w-full fixed bottom-6 left-0 right-0 px-4">
                        <button
                            onClick={() => setOpen(false)}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-black flex items-center justify-center border-4 border-black"
                        >
                            <X size={32} />
                        </button>
                        <button
                            disabled={state !== 'selected'}
                            onClick={handleUpload}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black text-white flex items-center justify-center transition-all duration-300 ease-in-out disabled:bg-gray-400"
                        >
                            {state === 'selected' && <ArrowUpFromLine size={32} />}
                            {state === 'uploading' && <Loader className="animate-spin" />}
                            {state === 'finished' && <RefreshCcw size={32} />}
                        </button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}