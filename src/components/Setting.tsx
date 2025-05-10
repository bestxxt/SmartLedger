import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Settings, Upload, Globe, LogOut } from "lucide-react"
import React, { useState, ChangeEvent, KeyboardEvent, useRef } from 'react'
import { useEffect } from 'react'
import { User, EditableUser, Language } from "@/types/user"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ScrollArea } from '@/components/ui/scroll-area';
import { signOut } from "next-auth/react"

export interface UserProps {
    user: User | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const TAG_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
]

// 添加常用货币列表
const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

// 添加语言列表
const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
]

// 图片压缩函数
async function compressImage(file: File, maxSizeKB: number = 128): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 如果图片太大，按比例缩小
                const maxDimension = 1024; // 最大尺寸
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // 转换为 base64
                let quality = 0.9;
                let base64 = canvas.toDataURL('image/jpeg', quality);

                // 如果还是太大，继续压缩
                while (base64.length > maxSizeKB * 1024 && quality > 0.1) {
                    quality -= 0.1;
                    base64 = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(base64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

export default function Setting({ user, open, onOpenChange }: UserProps) {
    // State
    if (!user) return null
    const [state, setState] = useState<EditableUser>({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        language: user.language,
        currency: user.currency,
        locations: user.locations,
        tags: user.tags,
    })
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openTagId, setOpenTagId] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState('');
    const [openLocationId, setOpenLocationId] = useState<string | null>(null);
    const [newLocationName, setNewLocationName] = useState('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Handlers
    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // 检查文件类型
                if (!file.type.startsWith('image/')) {
                    toast.error('Please select an image file');
                    return;
                }

                // 检查文件大小
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    toast.error('Image size should be less than 5MB');
                    return;
                }

                // 压缩图片并转换为 base64
                const base64 = await compressImage(file);

                setState(prev => ({
                    ...prev,
                    avatar: base64
                }));

                toast.success('Avatar updated successfully');
            } catch (error) {
                console.error('Error processing image:', error);
                toast.error('Failed to process image');
            }
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    }

    const handleTagEdit = (tagId: string, newName: string, newColor?: string) => {
        const updatedTags = state.tags.map(t =>
            t.id === tagId
                ? { ...t, name: newName, color: newColor || t.color }
                : t
        );
        setState(prev => ({
            ...prev,
            tags: updatedTags,
        }));
    };

    const addTag = () => {
        const value = newTagName.trim()
        if (value && !state.tags.some(tag => tag.name === value)) {
            setState(prev => ({
                ...prev,
                tags: [...prev.tags, {
                    id: `tag_${crypto.randomUUID()}`,
                    name: value,
                    color: selectedColor || TAG_COLORS[0].value,
                    createdAt: new Date().toISOString()
                }]
            }))
            setNewTagName('')
            setSelectedColor(null)
            setOpenTagId(null)
        }
    }

    const removeTag = (id: string) => {
        setState(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag.id !== id)
        }))
    }

    const handleSave = async () => {
        try {
            const response = await fetch('/api/app/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            const res = await response.json();
            const updatedUser = res.data;
            toast.success('Settings saved successfully');
            // Update user with the returned value
            setState({
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                language: updatedUser.language,
                currency: updatedUser.currency,
                locations: updatedUser.locations,
                tags: updatedUser.tags,
            });

            // Show success message
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Show error message
        }
    }

    const addLocation = () => {
        const value = newLocationName.trim()
        if (value && !state.locations.some(loc => loc.name === value)) {
            setState(prev => ({
                ...prev,
                locations: [...prev.locations, {
                    id: `loc_${crypto.randomUUID()}`,
                    name: value,
                    createdAt: new Date().toISOString()
                }]
            }))
            setNewLocationName('')
            setOpenLocationId(null)
        }
    }

    const removeLocation = (id: string) => {
        setState(prev => ({
            ...prev,
            locations: prev.locations.filter(loc => loc.id !== id)
        }))
    }

    const handleLocationEdit = (id: string, newName: string) => {
        if (newName.trim() && !state.locations.some(loc => loc.name === newName)) {
            setState(prev => ({
                ...prev,
                locations: prev.locations.map(loc =>
                    loc.id === id ? { ...loc, name: newName } : loc
                )
            }))
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full [&>button]:hidden">
                <SheetHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <SheetTitle>Settings</SheetTitle>
                            <SheetDescription>
                                Customize your profile
                            </SheetDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-auto px-4"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            Logout
                            <LogOut/>
                        </Button>
                    </div>
                </SheetHeader>
                <ScrollArea className="h-[85%]">
                    <div className="space-y-6 p-6 ">
                        {/* Avatar Section */}
                        <div className="space-y-2 ">
                            <Label>Profile Picture</Label>
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
                                    onClick={handleAvatarClick}
                                >
                                    {state.avatar ? (
                                        <img
                                            src={state.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <p className="text-sm text-gray-500">
                                    Click the avatar to change. Max size: 5MB
                                </p>
                            </div>
                        </div>
                        <hr />

                        {/* Language Section */}
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select
                                value={state.language}
                                onValueChange={(value) => {
                                    setState(prev => ({
                                        ...prev,
                                        language: value as Language
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select language">
                                        {state.language && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                <span>
                                                    {LANGUAGES.find(lang => lang.code === state.language)?.nativeName ||
                                                        LANGUAGES.find(lang => lang.code === state.language)?.name}
                                                </span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((language) => (
                                        <SelectItem key={language.code} value={language.code}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{language.nativeName}</span>
                                                <span className="text-gray-400 text-sm">({language.name})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <hr />

                        {/* Currency Section */}
                        <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select
                                value={state.currency}
                                onValueChange={(value) => {
                                    setState(prev => ({
                                        ...prev,
                                        currency: value
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.code} value={currency.code}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{currency.symbol}</span>
                                                <span className="text-gray-500">{currency.code}</span>
                                                <span className="text-gray-400 text-sm">({currency.name})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <hr />

                        {/* Tags Section */}
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {state.tags.map(tag => (
                                    <React.Fragment key={tag.id}>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "rounded-full min-w-fit",
                                                "border-2",
                                                tag.color && `border-[${tag.color}]`
                                            )}
                                            style={{
                                                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                                color: tag.color || undefined
                                            }}
                                            onClick={() => setOpenTagId(tag.id)}
                                        >
                                            <span className="whitespace-nowrap px-2">{tag.name}</span>
                                        </Button>
                                        <Drawer open={openTagId === tag.id} onOpenChange={(open) => !open && setOpenTagId(null)}>
                                            <DrawerContent>
                                                <DrawerHeader>
                                                    <DrawerTitle>Edit Tag</DrawerTitle>
                                                    <DrawerDescription>
                                                        Customize your tag appearance
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                <div className="grid gap-4 p-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="tag-name">Tag Name</Label>
                                                        <Input
                                                            id="tag-name"
                                                            value={tag.name}
                                                            onChange={e => handleTagEdit(tag.id, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Color</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {TAG_COLORS.map(color => (
                                                                <button
                                                                    key={color.value}
                                                                    type="button"
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                                        tag.color === color.value ? "border-foreground" : "border-transparent"
                                                                    )}
                                                                    style={{ backgroundColor: color.value }}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleTagEdit(tag.id, tag.name, color.value);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DrawerFooter>
                                                    <DrawerClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DrawerClose>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            removeTag(tag.id);
                                                            setOpenTagId(null);
                                                        }}
                                                    >
                                                        Remove Tag
                                                    </Button>
                                                </DrawerFooter>
                                            </DrawerContent>
                                        </Drawer>
                                    </React.Fragment>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setOpenTagId('new')}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Drawer open={openTagId === 'new'} onOpenChange={(open) => !open && setOpenTagId(null)}>
                                    <DrawerContent>
                                        <DrawerHeader>
                                            <DrawerTitle>Add New Tag</DrawerTitle>
                                            <DrawerDescription>
                                                Create a new tag for your transactions
                                            </DrawerDescription>
                                        </DrawerHeader>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            addTag();
                                        }} className="grid gap-4 p-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="new-tag">Tag Name</Label>
                                                <Input
                                                    id="new-tag"
                                                    value={newTagName}
                                                    onChange={e => setNewTagName(e.target.value)}
                                                    placeholder="Enter tag name"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Color</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {TAG_COLORS.map(color => (
                                                        <button
                                                            key={color.value}
                                                            type="button"
                                                            className={cn(
                                                                "w-8 h-8 rounded-full border-2 transition-all",
                                                                selectedColor === color.value ? "border-foreground" : "border-transparent"
                                                            )}
                                                            style={{ backgroundColor: color.value }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedColor(color.value);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </form>
                                        <DrawerFooter>
                                            <DrawerClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DrawerClose>
                                            <Button
                                                onClick={addTag}
                                                disabled={!newTagName}
                                            >
                                                Add Tag
                                            </Button>
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        </div>
                        <hr />

                        {/* Location Section */}
                        <div className="space-y-2">
                            <Label>Locations</Label>
                            <div className="flex flex-wrap gap-2">
                                {state.locations.map(location => (
                                    <React.Fragment key={location.id}>
                                        <Button
                                            variant="outline"
                                            className="rounded-full min-w-fit"
                                            onClick={() => setOpenLocationId(location.id)}
                                        >
                                            <span className="whitespace-nowrap px-2">{location.name}</span>
                                        </Button>
                                        <Drawer open={openLocationId === location.id} onOpenChange={(open) => !open && setOpenLocationId(null)}>
                                            <DrawerContent>
                                                <DrawerHeader>
                                                    <DrawerTitle>Edit Location</DrawerTitle>
                                                    <DrawerDescription>
                                                        Changes are saved automatically as you type.
                                                    </DrawerDescription>
                                                </DrawerHeader>
                                                <div className="grid gap-4 p-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="location-name">Location Name</Label>
                                                        <Input
                                                            id="location-name"
                                                            value={location.name}
                                                            onChange={e => handleLocationEdit(location.id, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <DrawerFooter>
                                                    <DrawerClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DrawerClose>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            removeLocation(location.id);
                                                            setOpenLocationId(null);
                                                        }}
                                                    >
                                                        Remove Location
                                                    </Button>
                                                </DrawerFooter>
                                            </DrawerContent>
                                        </Drawer>
                                    </React.Fragment>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setOpenLocationId('new')}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Drawer open={openLocationId === 'new'} onOpenChange={(open) => !open && setOpenLocationId(null)}>
                                    <DrawerContent>
                                        <DrawerHeader>
                                            <DrawerTitle>Add New Location</DrawerTitle>
                                            <DrawerDescription>
                                                Add a new location for your transactions.
                                            </DrawerDescription>
                                        </DrawerHeader>
                                        <div className="grid gap-4 p-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="new-location">Location Name</Label>
                                                <Input
                                                    id="new-location"
                                                    value={newLocationName}
                                                    onChange={e => setNewLocationName(e.target.value)}
                                                    placeholder="Enter location name"
                                                />
                                            </div>
                                        </div>
                                        <DrawerFooter>
                                            <DrawerClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DrawerClose>
                                            <Button onClick={addLocation}>
                                                Add Location
                                            </Button>
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        </div>
                        <hr />
                    </div>

                    <SheetFooter>
                        <div className="flex justify-evenly space-x-2 mb-6">
                            <SheetClose asChild>
                                <Button variant="outline" className="w-[45%] h-11">Cancel</Button>
                            </SheetClose>
                            <Button className="w-[45%] h-11" onClick={handleSave}>Save Changes</Button>
                        </div>
                    </SheetFooter>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}