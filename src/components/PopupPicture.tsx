'use client';
// Create PopupPicture component similar to PopupAudio for selecting, previewing, uploading image
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Camera, ArrowUpFromLine, X, Loader, RefreshCcw, Check } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmBillCard } from './BillCard';
import { EditableTransaction } from '@/models/transaction';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export interface PopupPictureProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}


export default function PopupPicture({ open, onOpenChange }: PopupPictureProps) {
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [state, setState] = useState<'idle' | 'selected' | 'uploading' | 'finished'>('idle');
    const [transactionCards, setTransactionCards] = useState<EditableTransaction[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useUserStore();
    // Add function to handle card removal
    const handleCardRemoval = (index: number) => {
        setTransactionCards(prev => {
            const newCards = prev.filter((_, idx) => idx !== index);
            // If this was the last card and we're in finished state, close the drawer
            if (newCards.length === 0 && state === 'finished') {
                onOpenChange?.(false);
            }
            return newCards;
        });
    };

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
        }
    };

    const handleUpload = async () => {
        if (state === 'idle') {
            inputRef.current?.click();
            return;
        }
        if (!photo) return;
        setState('uploading');
        const form = new FormData();
        form.append('file', photo);
        form.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
        form.append('userCurrency', user?.currency || 'USD');
        form.append('userLanguage', user?.language || 'en');
        form.append('userTags', JSON.stringify(user?.tags.map((tag) => tag.name) || []));
        form.append('userLocations', JSON.stringify(user?.locations.map((location) => location.name) || []));
        try {
            const res = await fetch('/api/app/ai/pictureToBill', { method: 'POST', body: form });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            if (!data.success) {
                setTransactionCards([]);
            } else {
                setTransactionCards([
                    {
                        amount: data.result.amount,
                        type: data.result.type,
                        category: data.result.category,
                        timestamp: new Date(data.result.timestamp),
                        note: data.result.note,
                        currency: data.result.currency,
                        tags: data.result.tags || [],
                        location: data.result.location || undefined,
                        emoji: data.result.emoji,
                    }
                ])
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
            <Drawer open={open} onOpenChange={onOpenChange}>

                <DrawerContent className="p-6 w-full h-full">
                    <DrawerTitle className="flex justify-center gap-2 text-gray-500">
                        <span></span>
                    </DrawerTitle>
                    <div className="flex-1 flex flex-col items-center">
                        {state === 'idle' && (
                            <div className="flex flex-col items-center justify-center h-[70%] text-center px-4">
                                <Camera className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">
                                    Take a Photo of Your Receipt
                                </h3>
                                <p className="text-gray-500">
                                    Click the upload button below to upload a photo of your receipt, bill or screenshot.
                                    We'll automatically extract the transaction details for you.
                                </p>
                            </div>
                        )}
                        {state === 'selected' && previewUrl && (
                            <img src={previewUrl} alt="Preview" className="max-h-[70%] object-contain mb-4" />
                        )}
                        {state === 'uploading' &&
                            <>
                                <Card className="w-full hover:shadow-md transition-shadow mt-2">
                                    <CardHeader className="">
                                        <Skeleton className="h-10 w-full mb-1 rounded bg-gray-200" />
                                    </CardHeader>
                                    <CardContent className="">
                                        <Skeleton className="h-7 w-64 mb-1 rounded bg-gray-200" />
                                        <Skeleton className="h-7 w-48 mb-1 rounded bg-gray-200" />
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-32 mb-1 rounded bg-gray-200" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-14 w-14 mb-1 rounded-full bg-gray-200" />
                                            <Skeleton className="h-14 w-14 mb-1 rounded-full bg-gray-200" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </>
                        }
                        {state === 'finished' && (
                            <ScrollArea className="h-auto max-h-[70%] w-full flex flex-col ">
                                {transactionCards.length > 0 ? (
                                    transactionCards.map((tx, i) => (
                                        <ConfirmBillCard
                                            key={i}
                                            transaction={tx}
                                            onSuccess={() => handleCardRemoval(i)}
                                            onCancel={() => handleCardRemoval(i)}
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
                            onClick={() => onOpenChange?.(false)}
                            className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center border-4 border-black"
                        >
                            <X size={32} />
                        </button>
                        <button
                            onClick={handleUpload}
                            className={cn(
                                "w-24 h-24 rounded-full text-white flex items-center justify-center transition-all duration-300 ease-in-out",
                                state === 'idle' ? 'bg-black' :
                                    state === 'selected' ? 'bg-black' :
                                        state === 'uploading' ? 'bg-gray-400' :
                                            'bg-black'
                            )}
                        >
                            {state === 'idle' && <Camera size={32} />}
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