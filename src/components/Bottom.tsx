'use client';

import { Camera, Plus, Mic } from 'lucide-react';


type BottomProps = {
    onPicture?: () => void;
    onAdd?: () => void;
    onAudio?: () => void;
};

export default function Bottom({ onPicture, onAdd, onAudio }: BottomProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t shadow z-50 flex items-start justify-evenly h-20">
            <button
                className="flex flex-col items-center justify-center p-3 text-gray-700 hover:bg-gray-100 rounded-full transition "
                onClick={onPicture}
                aria-label="Take picture"
            >
                <Camera className="w-7 h-7" />
            </button>
            <button
                className="flex flex-col items-center justify-center p-3 text-gray-700 hover:bg-gray-100 rounded-full transition"
                onClick={onAdd}
                aria-label="Add transaction"
            >
                <Plus className="w-8 h-8" />
            </button>
            <button
                className="flex flex-col items-center justify-center p-3 text-gray-700 hover:bg-gray-100 rounded-full transition"
                onClick={onAudio}
                aria-label="Record audio"
            >
                <Mic className="w-7 h-7" />
            </button>
        </div>
    );
}