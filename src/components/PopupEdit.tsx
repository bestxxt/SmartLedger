'use client';

import { useState, useEffect } from 'react';
import {
    CircleDollarSign,
    CirclePlus,
    CircleMinus,
    Wallet,
    Home,
    Utensils,
    Car,
    GraduationCap,
    Heart,
    PartyPopper,
    ShoppingBag,
    Users,
    Banknote,
    Gift,
    Receipt,
    PiggyBank,
    Briefcase,
    Building2,
    Workflow,
    Clock,
    Award,
    Trophy,
    Handshake,
    HeartHandshake,
    Package,
    HelpCircle,
    ArrowUpCircle,
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
import NumericKeypad from '@/components/NumericKeypad';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EditableTransaction, Transaction } from "@/models/transaction"
import { Input } from "@/components/ui/input"
import { main_income_categories, main_expense_categories } from "@/lib/constants"
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'sonner';
import FormattedNumber from './FormattedNumber';

// Define category icon mapping
const categoryIcons: Record<string, any> = {
    // Income category icons
    'Salary': Banknote,
    'Bonus': Award,
    'Investment': PiggyBank,
    'Business': Briefcase,
    'Rental': Building2,
    'Freelance': Workflow,
    'Part-time': Clock,
    'Dividends': Trophy,
    'Gifts': Gift,
    'Reimbursement': Receipt,
    'Subsidy': Receipt,
    'Lottery': PartyPopper,
    'Grants': Handshake,
    'Royalties': HeartHandshake,
    'Second-hand Sale': Package,
    'Borrowing': Wallet,
    'Charity': Heart,
    // Expense category icons
    'Housing': Home,
    'Food': Utensils,
    'Transportation': Car,
    'Education': GraduationCap,
    'Healthcare': Heart,
    'Entertainment': PartyPopper,
    'Shopping': ShoppingBag,
    'Social': Users,
    'Other': HelpCircle,
};

const CurrencySymbols: { [key: string]: string } = {
    'USD': '$',
    'CAD': '$',
    'CNY': '¥',
    'EUR': '€',
};

// DateTime picker component
function DateTimePicker({ timestamp, onTimestampChange }: { timestamp: Date, onTimestampChange: (date: Date) => void }) {
    return (
        <Popover modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-auto justify-start text-left font-normal h-16 rounded-lg"
                    )}
                >
                    <CalendarIcon />
                    <div className='flex items-center w-full'>
                        {format(timestamp, "PPp")}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
                <Calendar
                    mode="single"
                    selected={timestamp}
                    onSelect={(selectedDate) => {
                        if (!selectedDate) return;
                        const oldTime = timestamp;
                        const newDate = new Date(selectedDate);
                        newDate.setHours(oldTime.getHours());
                        newDate.setMinutes(oldTime.getMinutes());
                        newDate.setSeconds(oldTime.getSeconds());
                        onTimestampChange(newDate);
                    }}
                    initialFocus
                />
                <hr />
                <div className="flex items-center gap-2 p-4">
                    <Select
                        onValueChange={(value) => {
                            const date = new Date(timestamp);
                            const hours = date.getHours();
                            let newHour = hours;
                            if (value === 'AM') {
                                if (hours >= 12) newHour = hours - 12;
                            } else {
                                if (hours < 12) newHour = hours + 12;
                            }
                            date.setHours(newHour);
                            onTimestampChange(date);
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={format(timestamp, 'a')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        onValueChange={(value) => {
                            const date = new Date(timestamp);
                            const minutes = date.getMinutes();
                            const isPM = date.getHours() >= 12;
                            let hr = parseInt(value, 10);
                            if (isPM && hr < 12) hr += 12;
                            if (!isPM && hr === 12) hr = 0;
                            date.setHours(hr);
                            onTimestampChange(date);
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={format(timestamp, 'hh')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                                    {hour.toString().padStart(2, '0')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select
                        onValueChange={(value) => {
                            const date = new Date(timestamp);
                            date.setMinutes(parseInt(value, 10));
                            onTimestampChange(date);
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={format(timestamp, 'mm')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => i).map(min => (
                                <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                                    {min.toString().padStart(2, '0')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Category selector component
function CategorySelector({
    type,
    category,
    onCategoryChange
}: {
    type: 'income' | 'expense',
    category: string | undefined,
    onCategoryChange: (value: string) => void
}) {
    return (
        <div className="flex flex-col gap-4">
            <Select
                value={category || ''}
                onValueChange={onCategoryChange}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${type === 'income' ? 'Income' : 'Expense'} Category`}>
                        {category && (
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = categoryIcons[category] || HelpCircle;
                                    return <Icon className="h-4 w-4" />;
                                })()}
                                <span>{category}</span>
                            </div>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {(type === 'income' ? main_income_categories : main_expense_categories).map((cat) => {
                        const Icon = categoryIcons[cat] || HelpCircle;
                        return (
                            <SelectItem key={cat} value={cat}>
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{cat}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}

// Tag selector component
function TagSelector({ tags, selectedTags, onTagsChange }: {
    tags: Array<{ id: string, name: string, color?: string }>,
    selectedTags: string[],
    onTagsChange: (tags: string[]) => void
}) {
    // Create a collection of all tags, including user's current tags and transaction's selected tags
    const allTags = new Map<string, { id: string, name: string, color?: string }>();

    // Add user's current tags
    tags.forEach(tag => {
        allTags.set(tag.name, tag);
    });

    // Add transaction's selected tags that are not in user's current tags
    selectedTags.forEach(tagName => {
        if (!allTags.has(tagName)) {
            allTags.set(tagName, { id: tagName, name: tagName });
        }
    });

    return (
        <div className="flex flex-wrap gap-2">
            {Array.from(allTags.values()).map(tag => {
                const isSelected = selectedTags?.includes(tag.name);
                return (
                    <Button
                        key={tag.id}
                        variant="outline"
                        className={cn(
                            "rounded-full min-w-fit",
                            "border-2",
                            tag.color && `border-[${tag.color}]`,
                            isSelected && "bg-primary text-primary-foreground"
                        )}
                        style={{
                            backgroundColor: isSelected
                                ? (tag.color ? `${tag.color}20` : undefined)
                                : undefined,
                            color: isSelected
                                ? (tag.color || undefined)
                                : undefined
                        }}
                        onClick={() => {
                            onTagsChange(
                                isSelected
                                    ? selectedTags?.filter((t) => t !== tag.name) || []
                                    : [...(selectedTags || []), tag.name]
                            );
                        }}
                    >
                        <span className="whitespace-nowrap px-2">{tag.name}</span>
                    </Button>
                );
            })}
        </div>
    );
}

// Location selector component
function LocationSelector({ locations, selectedLocation, onLocationChange }: {
    locations: Array<{ id: string, name: string }>,
    selectedLocation: string | undefined,
    onLocationChange: (location: string) => void
}) {
    return (
        <Select
            value={selectedLocation || ''}
            onValueChange={onLocationChange}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
                {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                        {loc.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export interface PopupEditProps {
    transaction?: Transaction;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function PopupEdit({ transaction, open, onOpenChange }: PopupEditProps) {
    const { addTransaction, updateTransaction } = useTransactionStore();
    const { user } = useUserStore();

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
    const hasDifferentCurrency = isEditMode && transaction.originalCurrency !== transaction.currency;

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
                console.log('AI recognized transaction:', t);
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

    return (
        <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
            <DrawerContent className="p-6 w-full h-full px-2">
                <DrawerHeader className="pt-0">
                    <DrawerTitle className="flex justify-center gap-2">
                        <CircleDollarSign />
                        {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
                    </DrawerTitle>
                </DrawerHeader>
                {/* AI prompt input and upload button */}
                <div className="flex flex-col gap-4 w-full overflow-y-scroll">
                    <div className="space-y-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date & Time & Income / Expense
                        </label>
                        <div className='flex justify-between items-center'>
                            <DateTimePicker
                                timestamp={form.timestamp}
                                onTimestampChange={(date) => setForm(prev => ({ ...prev, timestamp: date }))}
                            />
                            <div className='flex gap-2'>
                                <button
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, type: 'income' }))}
                                    className={`border rounded-full h-14 w-14 px-4 flex items-center gap-2 transition 
                                    ${form.type === 'income' ? 'bg-teal-100 text-teal-700' : 'bg-white text-gray-700'}`}
                                >
                                    <CirclePlus />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, type: 'expense' }))}
                                    className={`border rounded-full h-14 w-14 px-4 flex items-center gap-2 transition 
                                    ${form.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700'}`}
                                >
                                    <CircleMinus />
                                </button>
                            </div>
                        </div>
                        <hr />
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount & Currency
                        </label>
                        <div className="flex flex-col gap-4">
                            <div className="flex-1">
                                <NumericKeypad
                                    value={form.originalAmount?.toString() || '0'}
                                    currencySymbols={CurrencySymbols[form.originalCurrency || 'USD']}
                                    onChange={(newVal) => {
                                        setForm((prev) => ({ ...prev, originalAmount: parseFloat(newVal) }));
                                    }}
                                />
                            </div>
                            <div className="flex gap-2 justify-center">
                                {Object.keys(CurrencySymbols).map((currency) => (
                                    <Button
                                        key={currency}
                                        variant="outline"
                                        className={cn(
                                            "w-15 justify-center",
                                            form.originalCurrency === currency && "bg-blue-500 text-primary-foreground",
                                        )}
                                        onClick={() => {
                                            setForm((prev) => ({ ...prev, originalCurrency: currency }));
                                        }}
                                    >
                                        {currency}
                                    </Button>
                                ))}
                            </div>
                            {isEditMode && hasDifferentCurrency && (
                                <div className="text-sm text-gray-500 text-center">
                                    Original amount: {form.originalAmount} {form.originalCurrency}
                                    <br />
                                    Converted to: {form.amount} {form.currency}
                                </div>
                            )}
                        </div>
                        <hr />
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <CategorySelector
                            type={form.type}
                            category={form.category}
                            onCategoryChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                        />
                        <hr />
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                        </label>
                        <Input
                            value={form.note || ''}
                            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                            placeholder="Add a note to your transaction"
                        />
                        <hr />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <LocationSelector
                            locations={user?.locations || []}
                            selectedLocation={form.location}
                            onLocationChange={(value) => setForm(prev => ({ ...prev, location: value }))}
                        />
                        <hr />
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <TagSelector
                            tags={user?.tags || []}
                            selectedTags={form.tags || []}
                            onTagsChange={(tags) => setForm(prev => ({ ...prev, tags }))}
                        />
                        <hr />
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emoji
                        </label>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                                {['💰', '🍔', '🚗', '🏠', '👕', '🎮', '📱', '✈️', '🎬', '📚'].map((emoji) => (
                                    <Button
                                        key={emoji}
                                        variant="outline"
                                        className={cn(
                                            "text-2xl",
                                            form.emoji === emoji && "bg-primary text-primary-foreground"
                                        )}
                                        onClick={() => setForm((prev) => ({ ...prev, emoji }))}
                                    >
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="text"
                                    value={form.emoji}
                                    onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))}
                                    className="w-28 text-2xl text-center p-0"
                                    placeholder="😊"
                                    maxLength={2}
                                />
                                <span className="text-sm text-gray-500">Input custom emoji</span>
                            </div>
                        </div>
                    </div>
                </div>
                <DrawerFooter className=''>
                    <div className="flex items-center gap-3 mb-4 relative">
                        <Input
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            placeholder="AI recognition"
                            className="flex-1 h-12 rounded-full pr-14 bg-gradient-to-r from-blue-50/30 to-purple-50/30 border-blue-200 focus-visible:ring-blue-300"
                            disabled={aiLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !aiLoading && aiInput.trim()) {
                                    handleAIPrompt();
                                }
                            }}
                        />
                        <Button
                            onClick={handleAIPrompt}
                            disabled={aiLoading || !aiInput.trim()}
                            variant="outline"
                            size="icon"
                            className={`h-10 w-15 rounded-full absolute right-1 transition-all duration-300 
                                ${aiLoading ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-100 hover:border-blue-400 hover:shadow-md'} 
                                ${aiInput.trim() ? 'border-blue-400 bg-gradient-to-r from-blue-100 to-purple-100' : 'opacity-70'}`}
                        >
                            <ArrowUpCircle className={`transition-all ${aiLoading ? 'animate-bounce text-blue-500' : 'text-blue-600 hover:scale-110'}`} />
                        </Button>
                    </div>
                    <div className='flex justify-between'>
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-[49%] h-10">Cancel</Button>
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
    );
}

