'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import {
    CircleDollarSign,
    ArrowUpCircle,
    X,
    Camera,
    Mic,
    Loader,
} from 'lucide-react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { EditableTransaction, Transaction } from "@/models/transaction"
import { Input } from "@/components/ui/input"
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import EditForm from './EditForm';
import PopupPicture from './PopupPicture';
import PopupAudio from './PopupAudio';


export interface PopupEditProps {
    transaction?: Transaction;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function PopupEdit({ transaction, open, onOpenChange }: PopupEditProps) {
    const { addTransaction, updateTransaction } = useTransactionStore();
    const { user } = useUserStore();
    const inputRef = useRef<HTMLInputElement>(null);
    if (!user) {
        return null;
    }

    const [form, setForm] = useState<EditableTransaction>({
        amount: transaction?.amount || 0,
        originalAmount: transaction?.originalAmount,
        currency: transaction?.currency || user.currency || 'USD',
        originalCurrency: transaction?.originalCurrency || user.currency || 'USD',
        type: transaction?.type || 'expense',
        category: transaction?.category || 'Other',
        timestamp: transaction?.timestamp || new Date(),
        note: transaction?.note || '',
        tags: transaction?.tags || [],
        location: transaction?.location || '',
        emoji: transaction?.emoji || '💰',
    });

    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const isEditMode = !!transaction;
    // Camera (picture) state
    const [cameraProcessing, setCameraProcessing] = useState(false);
    // Audio recording state
    const [recordState, setRecordState] = useState<'idle' | 'recording' | 'uploading' | 'finished'>('idle');
    const [buttonEnabled, setButtonEnabled] = useState(true);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Reset audio on drawer close
    useEffect(() => {
        if (!open) {
            // stop recording if active
            mediaRecorderRef.current?.state !== 'inactive' && mediaRecorderRef.current?.stop();
            streamRef.current?.getTracks().forEach(t => t.stop());
            setRecordState('idle');
            audioChunksRef.current = [];
            setButtonEnabled(true);
        }
    }, [open]);


    useEffect(() => {
        if (transaction) {
            setForm({
                amount: transaction.amount,
                currency: transaction.currency || user?.currency || 'USD',
                originalCurrency: transaction.originalCurrency,
                originalAmount: transaction.originalAmount,
                type: transaction.type,
                category: transaction.category,
                timestamp: transaction.timestamp,
                note: transaction.note || '',
                tags: transaction.tags || [],
                location: transaction.location || '',
                emoji: transaction.emoji || '💰',
            });
        }
    }, [transaction]);

    const resetForm = () => {
        setAiInput('');
        setForm({
            amount: 0,
            originalAmount: 0.00,
            currency: user?.currency || 'USD',
            originalCurrency: user?.currency || 'USD',
            type: 'expense',
            category: 'Other',
            timestamp: new Date(),
            note: '',
            tags: [],
            location: '',
            emoji: '💰',
        });
    }

    const handleSubmit = async () => {
        try {
            if (isEditMode && transaction) {
                await updateTransaction(form, transaction.id);
            } else {
                await addTransaction(form);
            }

            if (!isEditMode) {
                setForm({
                    amount: 0,
                    originalAmount: 0.00,
                    currency: user?.currency || 'USD',
                    originalCurrency: user?.currency || 'USD',
                    type: 'expense',
                    category: 'Other',
                    timestamp: new Date(),
                    note: '',
                    tags: [],
                    location: '',
                    emoji: '💰',
                });
                setAiInput('');
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
        }
    };

    const handleAIPrompt = async () => {
        if (!aiInput.trim()) return;
        setAiLoading(true);
        try {
            const formData = await fetch('/api/app/ai/textToBill', {
                method: 'POST',
                body: JSON.stringify({
                    text: aiInput,
                    userCurrency: user?.currency || 'USD',
                    userLanguage: user?.language || 'en',
                    userTags: JSON.stringify(user?.tags.map(tag => tag.name) || []),
                    userLocations: JSON.stringify(user?.locations.map(loc => loc.name) || []),
                    localTime: new Date().toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });
            const data = await formData.json();
            if (data.success && data.result && data.result.length > 0) {
                const t = data.result[0];
                // console.log('AI recognized transaction:', t);
                setForm(prev => ({
                    ...prev,
                    originalAmount: t.amount,
                    originalCurrency: t.currency,
                    type: t.type,
                    category: t.category,
                    timestamp: new Date(t.timestamp),
                    note: t.note,
                    tags: t.tags,
                    location: t.location,
                    emoji: t.emoji,
                }));
                toast.success('Recognition successful. Form auto-filled.');
            } else {
                toast.error('No valid transaction information recognized.');
            }
        } catch (err) {
            toast.error('Recognition failed.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCameraProcessing(true);
        // create submit form
        const form = new FormData();
        form.append('file', file);
        form.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
        form.append('userCurrency', user?.currency || 'USD');
        form.append('userLanguage', user?.language || 'en');
        form.append('userTags', JSON.stringify(user?.tags.map((tag) => tag.name) || []));
        form.append('userLocations', JSON.stringify(user?.locations.map((location) => location.name) || []));

        fetch('/api/app/ai/pictureToBill', { method: 'POST', body: form })
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    // update your form…
                    setForm(prev => ({
                        ...prev,
                        originalAmount: data.result.amount,
                        originalCurrency: data.result.currency,
                        type: data.result.type,
                        category: data.result.category,
                        timestamp: new Date(data.result.timestamp),
                        note: data.result.note,
                        tags: data.result.tags || [],
                        location: data.result.location || undefined,
                        emoji: data.result.emoji,
                    }));
                } else {
                    toast.error('Failed to recognize transaction.');
                }
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to recognize transaction.');
            })
            .finally(() => {
                setCameraProcessing(false);
            });
    };

    // Audio recorder handler
    const handleMic = async () => {
        switch (recordState) {
            case 'idle': {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    const recorder = new MediaRecorder(stream);
                    mediaRecorderRef.current = recorder;
                    audioChunksRef.current = [];
                    recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
                    recorder.start();
                    setRecordState('recording');
                } catch (err) {
                    console.error(err);
                    toast.error('Microphone error');
                }
                break;
            }
            case 'recording': {
                setButtonEnabled(false);
                setRecordState('uploading');
                mediaRecorderRef.current?.stop();
                streamRef.current?.getTracks().forEach(t => t.stop());
                await new Promise<void>(res => {
                    if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = () => res();
                    else res();
                });
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], 'rec.webm', { type: blob.type });
                const body = new FormData();
                body.append('file', file);
                body.append('localTime', new Date().toISOString());
                body.append('userCurrency', user?.currency || 'USD');
                body.append('userLanguage', user?.language || 'en');
                body.append('userTags', JSON.stringify(user?.tags.map((tag) => tag.name) || []));
                body.append('userLocations', JSON.stringify(user?.locations.map((location) => location.name) || []));
                const res = await fetch('/api/app/ai/audioToBill', { method: 'POST', body });
                const data = await res.json();
                console.log('data', data);
                if (data.result) {
                    const t = Array.isArray(data.result) ? data.result[0] : data.result;
                    setForm(prev => ({
                        ...prev,
                        originalAmount: t.amount,
                        originalCurrency: t.currency,
                        type: t.type,
                        category: t.category,
                        timestamp: new Date(t.timestamp),
                        note: t.note || '',
                        tags: t.tags || [],
                        location: t.location || '',
                        emoji: t.emoji || '💰',
                    }));
                } else {
                    toast.error('Audio recognition failed');
                }
                setButtonEnabled(true);
                setRecordState('idle');
                break;
            }
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

            <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
                <DrawerContent className="p-6 w-full px-2">
                    <DrawerHeader className="pt-0">
                        <DrawerTitle className="flex justify-center gap-2">
                            <CircleDollarSign />
                            {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
                        </DrawerTitle>
                    </DrawerHeader>
                    {/* AI prompt input and upload button */}
                    <EditForm formData={form} onFormChange={setForm} />

                    <DrawerFooter className=''>
                        <div className="flex items-center gap-3 mb-4 relative">
                            <div className="relative flex-1">
                                <Input
                                    value={aiInput}
                                    onChange={e => setAiInput(e.target.value)}
                                    placeholder="AI recognition"
                                    className={`w-full h-12 pl-20 rounded-full pr-14 transition-all duration-300
                                    ${aiLoading
                                            ? 'bg-blue-100 border-blue-300'
                                            : 'bg-gradient-to-r from-blue-50/30 to-purple-50/30 border-blue-200 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md'
                                        }
                                    ${aiInput.trim()
                                            ? 'border-blue-400 bg-gradient-to-r from-blue-100 to-purple-100'
                                            : 'opacity-70'
                                        }
                                    focus-visible:ring-blue-300`}
                                    disabled={aiLoading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !aiLoading && aiInput.trim()) {
                                            handleAIPrompt();
                                        }
                                    }}
                                />
                                <button
                                    className="hover:scale-110 w-10 h-10 rounded-full absolute left-1 top-1 transition-all duration-300 flex items-center justify-center"
                                    onClick={() => inputRef.current?.click()}
                                    disabled={cameraProcessing}
                                >
                                    {cameraProcessing === true ? <Loader className="animate-spin w-4 h-4" /> : <Camera className="w-4 h-4" />}
                                </button>
                                <button
                                    className={`hover:scale-110 w-10 h-10 rounded-full absolute left-10 top-1  transition-all duration-300 flex items-center justify-center
                  ${recordState === 'recording' ? 'text-red-500 border-2 border-red-500 animate-pulse' : ''}  
                  ${recordState === 'uploading' ? 'text-blue-500' : ''}`}
                                    onClick={handleMic}
                                    disabled={!buttonEnabled}
                                >
                                    {recordState === 'uploading' ? <Loader className="animate-spin w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleAIPrompt}
                                    disabled={aiLoading || !aiInput.trim()}
                                    className="h-10 w-10 rounded-full absolute right-1 top-1 transition-all duration-300 flex items-center justify-center"
                                >
                                    <ArrowUpCircle className={`transition-all ${aiLoading ? 'animate-bounce text-blue-500' : 'text-blue-600 hover:scale-110'}`} />
                                </button>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-[49%] h-10" onClick={() => resetForm()}>Cancel</Button>
                            </DrawerClose>
                            <DrawerClose asChild>
                                <Button
                                    className="w-[49%] h-10"
                                    onClick={handleSubmit}
                                >
                                    {isEditMode ? 'Save Changes' : 'Add'}
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

