import { FormEvent, useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { User, Tag } from "@/models/user"
import { Input } from "@/components/ui/input"
import { main_income_categories, main_expense_categories, sub_expense_categories } from "@/lib/constants"

// 定义分类图标映射
const categoryIcons: Record<string, any> = {
    // 收入分类图标
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
    // 支出分类图标
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

// 日期时间选择器组件
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

// 分类选择组件
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

// 标签选择组件
function TagSelector({ tags, selectedTags, onTagsChange }: {
    tags: Array<{ id: string, name: string, color?: string }>,
    selectedTags: string[],
    onTagsChange: (tags: string[]) => void
}) {
    // 创建一个包含所有标签的集合，包括用户当前标签和交易中已选择的标签
    const allTags = new Map<string, { id: string, name: string, color?: string }>();

    // 添加用户当前标签
    tags.forEach(tag => {
        allTags.set(tag.name, tag);
    });

    // 添加交易中已选择但不在用户当前标签中的标签
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

// 位置选择组件
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
    onSubmit?: (tx: EditableTransaction) => Promise<void>
    onChange?: (value: string) => void;
    user: User | null;
    transaction?: Transaction;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    source?: 'home' | 'transaction';
}

export default function PopupEdit({ onSubmit, user, transaction, open, onOpenChange }: PopupEditProps) {
    if (!user) {
        return null;
    }
    const [form, setForm] = useState<EditableTransaction>({
        amount: transaction?.amount || 0,
        type: transaction?.type || 'expense',
        category: transaction?.category || 'Other',
        timestamp: transaction?.timestamp || new Date(),
        note: transaction?.note || '',
        currency: transaction?.currency || user.currency || 'USD',
        tags: transaction?.tags || [],
        location: transaction?.location || '',
        emoji: transaction?.emoji || '💰',
    });

    const isEditMode = !!transaction;

    useEffect(() => {
        if (transaction) {
            setForm({
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                timestamp: transaction.timestamp,
                note: transaction.note || '',
                currency: transaction.currency || user?.currency || 'USD',
                tags: transaction.tags || [],
                location: transaction.location || '',
                emoji: transaction.emoji || '💰',
            });
        }
    }, [transaction]);

    const handleSubmit = async () => {
        try {
            if (onSubmit) {
                await onSubmit(form);
            }

            if (!isEditMode) {
                setForm({
                    amount: 0,
                    type: 'expense',
                    category: 'Other',
                    timestamp: new Date(),
                    note: '',
                    currency: user?.currency || 'USD',
                    tags: [],
                    location: '',
                    emoji: '💰',
                });
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="p-6 w-full h-full">
                <DrawerHeader className="pt-0">
                    <DrawerTitle className="flex justify-center gap-2">
                        <CircleDollarSign />
                        {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 w-full h-full overflow-y-scroll">
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
                                    initialValue={form.amount.toString()}
                                    currencySymbols={form.currency === 'CNY' ? '¥' : form.currency === 'EUR' ? '€' : '$'}
                                    onChange={(newVal) => {
                                        setForm((prev) => ({ ...prev, amount: parseFloat(newVal), }));
                                    }}
                                />
                            </div>
                            <div className="flex gap-2 justify-center">
                                {[
                                    { value: 'USD', symbol: '$', label: 'USD' },
                                    { value: 'CAD', symbol: '$', label: 'CAD' },
                                    { value: 'CNY', symbol: '¥', label: 'CNY' },
                                    { value: 'EUR', symbol: '€', label: 'EUR' },
                                ].map((currency) => (
                                    <Button
                                        key={currency.value}
                                        variant="outline"
                                        className={cn(
                                            "w-15 justify-center",
                                            form.currency === currency.value && "bg-primary text-primary-foreground"
                                        )}
                                        onClick={() => setForm((prev) => ({ ...prev, currency: currency.value }))}
                                    >
                                        {currency.value}
                                    </Button>
                                ))}
                            </div>
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
                <DrawerFooter>
                    <div className='flex justify-between'>
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-[49%] h-12">Cancel</Button>
                        </DrawerClose>
                        <DrawerClose asChild>
                            <Button
                                className="w-[49%] h-12"
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

