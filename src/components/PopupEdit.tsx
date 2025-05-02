import { FormEvent, useState } from 'react';
import { Plus, CircleDollarSign, CirclePlus, CircleMinus, Wallet } from 'lucide-react';
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


export interface PopupEditProps {
    onSubmit?: (data: PopupEditState) => void;
    onChange?: (value: string) => void;
}

export interface PopupEditState {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    subcategory?: string;
    timestamp: Date;

    note?: string;
    currency?: string;
    tags?: string[];
    location?: string;

    onSubmit: (data: PopupEditState) => void;
}

export default function PopupEdit({ onSubmit }: PopupEditProps) {
    const [form, setForm] = useState<PopupEditState>({
        id: '',
        amount: 0,
        type: 'income',
        category: '',
        timestamp: new Date(),
        onSubmit: () => { },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(form);
        }
        setForm({
            id: '',
            amount: 0,
            type: 'expense',
            category: '',
            timestamp: new Date(),
            onSubmit: () => { },
        });
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <button
                    className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg"
                    aria-label="Add transaction"
                >
                    <Plus />
                </button>
            </DrawerTrigger>
            <DrawerContent className="p-6 w-full h-full">
                <DrawerHeader>
                    <DrawerTitle className="flex justify-center gap-2">
                        <CircleDollarSign />
                        Add Transaction
                    </DrawerTitle>
                </DrawerHeader>

                <ScrollArea className="h-[90%]">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date & Time & Income / Expense
                            </label>
                            <div className='flex justify-between items-center'>
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
                                                {format(form.timestamp, "PPp")}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start">
                                        <Calendar
                                            mode="single"
                                            selected={form.timestamp}
                                            onSelect={(selectedDate) => {
                                                if (!selectedDate) return;

                                                setForm((prev) => {
                                                    const oldTime = prev.timestamp;
                                                    const newDate = new Date(selectedDate);

                                                    // 把旧时间的小时和分钟设置到新日期上
                                                    newDate.setHours(oldTime.getHours());
                                                    newDate.setMinutes(oldTime.getMinutes());
                                                    newDate.setSeconds(oldTime.getSeconds());

                                                    return {
                                                        ...prev,
                                                        timestamp: newDate,
                                                    };
                                                });
                                            }}
                                            initialFocus
                                        />
                                        <hr />
                                        <div className="flex items-center gap-2 p-4">
                                            {/* AM/PM */}
                                            <Select
                                                onValueChange={(value) => {
                                                    setForm(prev => {
                                                        const date = new Date(prev.timestamp);
                                                        const hours = date.getHours();
                                                        let newHour = hours;
                                                        if (value === 'AM') {
                                                            if (hours >= 12) newHour = hours - 12;
                                                        } else {
                                                            if (hours < 12) newHour = hours + 12;
                                                        }
                                                        date.setHours(newHour);
                                                        return { ...prev, timestamp: date };
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="w-[70px]">
                                                    <SelectValue placeholder={format(form.timestamp, 'a')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AM">AM</SelectItem>
                                                    <SelectItem value="PM">PM</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {/* Hour */}
                                            <Select
                                                onValueChange={(value) => {
                                                    setForm(prev => {
                                                        const date = new Date(prev.timestamp);
                                                        const minutes = date.getMinutes();
                                                        const isPM = date.getHours() >= 12;
                                                        let hr = parseInt(value, 10);
                                                        if (isPM && hr < 12) hr += 12;
                                                        if (!isPM && hr === 12) hr = 0;
                                                        date.setHours(hr);
                                                        return { ...prev, timestamp: date };
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="w-[70px]">
                                                    <SelectValue placeholder={format(form.timestamp, 'hh')} />
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
                                            {/* Minute */}
                                            <Select
                                                onValueChange={(value) => {
                                                    setForm(prev => {
                                                        const date = new Date(prev.timestamp);
                                                        date.setMinutes(parseInt(value, 10));
                                                        return { ...prev, timestamp: date };
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="w-[70px]">
                                                    <SelectValue placeholder={format(form.timestamp, 'mm')} />
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
                                Amount
                            </label>
                            <div>
                                <NumericKeypad
                                    initialValue={form.amount.toString()}
                                    onChange={(newVal) => {
                                        setForm((prev) => ({ ...prev, amount: parseFloat(newVal), }));
                                    }}
                                />
                            </div>
                            <hr />
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            {form.type === 'income' ? (
                                <div className="flex gap-4 justify-center items-center">
                                    <Select
                                        value={form.category} // Set the value to the current form.category
                                        onValueChange={(value) => {
                                            setForm((prev) => ({ ...prev, category: value, subcategory: '' })); // Reset subcategory when category changes
                                        }}
                                    >
                                        <SelectTrigger className="w-auto">
                                            <SelectValue placeholder="Select Income Category">
                                                {form.category || "Select Income Category"} {/* Display selected value or placeholder */}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Salary">
                                                <CircleDollarSign className="mr-2 h-4 w-4" />
                                                Salary
                                            </SelectItem>
                                            <SelectItem value="Investments">
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Investments
                                            </SelectItem>
                                            <SelectItem value="Freelancing">
                                                <CirclePlus className="mr-2 h-4 w-4" />
                                                Freelancing
                                            </SelectItem>
                                            <SelectItem value="Other">
                                                <CircleMinus className="mr-2 h-4 w-4" />
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.category && (
                                        <Select
                                            value={form.subcategory} // Set the value to the current form.subcategory
                                            onValueChange={(value) => {
                                                setForm((prev) => ({ ...prev, subcategory: value }));
                                            }}
                                        >
                                            <SelectTrigger className="w-auto">
                                                <SelectValue placeholder="Select Subcategory">
                                                    {form.subcategory || "Select Subcategory"} {/* Display selected value or placeholder */}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {form.category === "Salary" && (
                                                    <>
                                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                                        <SelectItem value="Bonus">Bonus</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Investments" && (
                                                    <>
                                                        <SelectItem value="Stocks">Stocks</SelectItem>
                                                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Freelancing" && (
                                                    <>
                                                        <SelectItem value="Projects">Projects</SelectItem>
                                                        <SelectItem value="Consulting">Consulting</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Other" && (
                                                    <>
                                                        <SelectItem value="Gifts">Gifts</SelectItem>
                                                        <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-4 justify-center items-center">
                                    <Select
                                        value={form.category} // Set the value to the current form.category
                                        onValueChange={(value) => {
                                            setForm((prev) => ({ ...prev, category: value, subcategory: '' })); // Reset subcategory when category changes
                                        }}
                                    >
                                        <SelectTrigger className="w-auto">
                                            <SelectValue placeholder="Select Expense Category">
                                                {form.category || "Select Expense Category"} {/* Display selected value or placeholder */}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Food">
                                                <CircleDollarSign className="mr-2 h-4 w-4" />
                                                Food
                                            </SelectItem>
                                            <SelectItem value="Transport">
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Transport
                                            </SelectItem>
                                            <SelectItem value="Shopping">
                                                <CirclePlus className="mr-2 h-4 w-4" />
                                                Shopping
                                            </SelectItem>
                                            <SelectItem value="Other">
                                                <CircleMinus className="mr-2 h-4 w-4" />
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.category && (
                                        <Select
                                            value={form.subcategory} // Set the value to the current form.subcategory
                                            onValueChange={(value) => {
                                                setForm((prev) => ({ ...prev, subcategory: value }));
                                            }}
                                        >
                                            <SelectTrigger className="w-auto">
                                                <SelectValue placeholder="Select Subcategory">
                                                    {form.subcategory || "Select Subcategory"} {/* Display selected value or placeholder */}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {form.category === "Food" && (
                                                    <>
                                                        <SelectItem value="Groceries">Groceries</SelectItem>
                                                        <SelectItem value="Dining Out">Dining Out</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Transport" && (
                                                    <>
                                                        <SelectItem value="Fuel">Fuel</SelectItem>
                                                        <SelectItem value="Public Transport">Public Transport</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Shopping" && (
                                                    <>
                                                        <SelectItem value="Clothing">Clothing</SelectItem>
                                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                                    </>
                                                )}
                                                {form.category === "Other" && (
                                                    <>
                                                        <SelectItem value="Gifts">Gifts</SelectItem>
                                                        <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}
                            <DrawerFooter className="pt-4 ">
                                <div className='flex justify-between'>
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="w-[49%] h-12">Cancel</Button>
                                    </DrawerClose>
                                    <DrawerClose asChild>
                                        <Button type="submit" className="w-[49%] h-12">Add</Button>
                                    </DrawerClose>
                                </div>
                            </DrawerFooter>
                        </div>
                    </form>
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
}

