"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import NumericKeypad from "@/components/NumericKeypad";
import { EditableTransaction } from "@/models/transaction";
import { main_categories } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useUserStore } from '@/store/useUserStore';
import { CURRENCIES } from "@/config/constants";


const emojiList = ['💰', '🍔', '🚗', '🏠', '👕', '🎮', '📱', '✈️', '🎬', '📚'];

// DateTime picker component
function DateTimePicker({ timestamp, onTimestampChange }: { timestamp: Date, onTimestampChange: (date: Date) => void }) {
  return (
    <>
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
      <div className="flex items-center gap-2 p-4 justify-center">
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
          <SelectTrigger className="w-auto">
            <SelectValue placeholder={format(timestamp, 'hh')} />
          </SelectTrigger>
          <SelectContent position="popper" side="top" align="center">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
              <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                {hour.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-gray-500 font-bold">:</span>
        <Select
          onValueChange={(value) => {
            const date = new Date(timestamp);
            date.setMinutes(parseInt(value, 10));
            onTimestampChange(date);
          }}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder={format(timestamp, 'mm')} />
          </SelectTrigger>
          <SelectContent position="popper" side="top" align="center">
            {Array.from({ length: 60 }, (_, i) => i).map(min => (
              <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                {min.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <SelectTrigger className="w-auto">
            <SelectValue placeholder={format(timestamp, 'a')} />
          </SelectTrigger>
          <SelectContent position="popper" side="top" align="center">
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
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

interface EditFormProps {
  formData: EditableTransaction;
  onFormChange: (formData: EditableTransaction) => void;
}

export default function EditForm({
  formData,
  onFormChange,
}: EditFormProps) {
  const { user } = useUserStore();
  const handleChange = (updates: Partial<EditableTransaction>) => {
    onFormChange({ ...formData, ...updates });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {/* Emoji Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <span className="cursor-pointer hover:bg-gray-100 p-1 rounded-md w-10 text-center border border-gray-300">
                  {formData.emoji || '💰'}
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Emoji</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-500">Emoji</p>
                <div className="grid grid-cols-5 gap-2 ">
                  {emojiList.map((emoji) => (
                    <button
                      key={emoji}
                      className={cn(
                        "text-2xl p-0 h-12 w-12 border border-gray-300 rounded-lg flex items-center justify-center",
                        formData.emoji === emoji && "border-black border-2"
                      )}
                      onClick={() => handleChange({ emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Custom Emoji</p>
                <div>
                  <Input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => handleChange({ emoji: e.target.value })}
                    className="text-center text-2xl h-12 w-18"
                    placeholder="😊"
                    maxLength={1}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <span className="cursor-pointer hover:bg-gray-100 py-1 px-2 rounded-md max-w-50 min-w-30 text-left border border-gray-300 truncate">
                  {formData.category || 'Select category'}
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Category</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px]">
                  <div className="grid gap-2 p-2">
                    {main_categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={formData.category === cat ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => handleChange({ category: cat })}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardTitle>

          {/* Amount and Currency */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <span className={cn(
                  "font-bold cursor-pointer hover:bg-gray-100 p-1 rounded-md text-center border border-gray-300 truncate max-w-20 min-w-15",
                  formData.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {formData.type === 'income' ? '+' : '-'}
                  {formData.originalAmount ? formData.originalAmount : '0'}
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Amount</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4">
                  <NumericKeypad
                    value={formData.originalAmount?.toString() || '0'}
                    currencySymbols={CURRENCIES.find(c => c.code === formData.originalCurrency)?.symbol || '$'}
                    onChange={(newVal) => {
                      handleChange({ originalAmount: parseFloat(newVal) });
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant={formData.type === 'income' ? "default" : "outline"}
                      onClick={() => handleChange({ type: 'income' })}
                      className="flex-1"
                    >
                      Income
                    </Button>
                    <Button
                      variant={formData.type === 'expense' ? "default" : "outline"}
                      onClick={() => handleChange({ type: 'expense' })}
                      className="flex-1"
                    >
                      Expense
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {/* Currency Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <span className={cn(
                  "cursor-pointer hover:bg-gray-100 p-1 rounded-md font-bold text-center border border-gray-300 truncate max-w-20",
                  formData.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {formData.originalCurrency || 'USD'}
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Currency</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-2 p-4">
                  {CURRENCIES.map((currency) => (
                    <Button
                      key={currency.code}
                      variant={formData.originalCurrency === currency.code ? "default" : "outline"}
                      onClick={() => handleChange({ originalCurrency: currency.code })}
                    >
                      {currency.symbol}({currency.code})
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm space-y-1">
          {/* Note Dialog */}
          <div>
            <Input
              value={formData.note || ''}
              onChange={(e) => handleChange({ note: e.target.value })}
              placeholder="Add a note to your transaction"
              className="w-full h-10 px-2"
            />
          </div>

          {/* Date Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <p className="text-gray-500 cursor-pointer flex items-center hover:bg-gray-100 px-2 rounded-md max-w-full text-left border h-10 border-gray-300 truncate">
                {format(formData.timestamp, "PPp")}
              </p>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Date & Time</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <DateTimePicker
                  timestamp={formData.timestamp}
                  onTimestampChange={(date) => handleChange({ timestamp: date })}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Tag Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="text-gray-600 cursor-pointer flex items-center hover:bg-gray-100 px-2 rounded-md max-w-full text-left border border-gray-300 truncate">
                <div className="flex flex-wrap gap-2 min-h-10 items-center">
                  {formData.tags?.length === 0 && (
                    <span className="text-gray-500">Add tags...</span>
                  )}
                  {formData.tags?.map((tag) => (
                    <span key={tag} className={cn("rounded-md border px-2 py-1 text-sm")}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Tags</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <TagSelector
                  tags={user?.tags || []}
                  selectedTags={formData.tags || []}
                  onTagsChange={(tags) => handleChange({ tags })}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>


      </CardContent>

      <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between items-center">
        {/* Location Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <p className="min-w-25 cursor-pointer hover:bg-gray-100 p-1 rounded-md max-w-full border px-2 h-10 border-gray-300 truncate flex items-center">
              {formData.location || "Add location..."}
            </p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              <div className="flex flex-wrap gap-2">
                {user?.locations?.map((location) => (
                  <Button
                    key={location.id}
                    variant={formData.location === location.name ? "default" : "outline"}
                    className="rounded-full min-w-fit"
                    onClick={() => handleChange({ location: location.name })}
                  >
                    <span className="whitespace-nowrap px-2">{location.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

