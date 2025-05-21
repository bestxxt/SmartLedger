'use client';

import { MoreHorizontal } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from '@/store/useUserStore';

type HeadProps = {
    onMenuClick?: () => void;
};

export default function Head({ onMenuClick }: HeadProps) {
    const { user, user_loading } = useUserStore();

    if (user_loading || !user) {
        return (
            <div className="flex items-center justify-between py-2 px-4 w-full bg-white">
                <Skeleton className="h-14 w-14 rounded-full bg-gray-200 ml-2" />
                <div className="flex-1 flex flex-col ml-3">
                    <Skeleton className="h-5 w-32 mb-1 rounded bg-gray-200" />
                    <Skeleton className="h-4 w-24 rounded bg-gray-200" />
                </div>
                <MoreHorizontal className="w-6 h-6 text-gray-800" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-2 px-4 w-full bg-white">
            <img
                src={user.avatar}
                alt={`${user.name}'s Avatar`}
                className="w-14 h-14 rounded-full object-cover ml-2"
            />
            <div className="flex-1 flex flex-col ml-3">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-lg truncate">{user.name || "Terry's Notion"}</span>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-gray-500 text-sm truncate">{user.email}</span>
                </div>
            </div>
            <button
                className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <MoreHorizontal className="w-6 h-6 text-gray-800" />
            </button>
        </div>
    );
}