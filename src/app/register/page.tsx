'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Key, Mail, Ticket, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

// Image compression function
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
                
                // If the image is too large, scale it proportionally
                const maxDimension = 1024; // Maximum dimension
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

                // Convert to base64
                let quality = 0.9;
                let base64 = canvas.toDataURL('image/jpeg', quality);

                // If still too large, continue compressing
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

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [avatar, setAvatar] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Check file type
                if (!file.type.startsWith('image/')) {
                    toast.error('Please select an image file');
                    return;
                }

                // Check file size
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    toast.error('Image size should be less than 5MB');
                    return;
                }

                // Compress image and convert to base64
                const base64 = await compressImage(file);
                setAvatar(base64);
                toast.success('Avatar uploaded successfully');
            } catch (error) {
                console.error('Error processing image:', error);
                toast.error('Failed to process image');
            }
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/account/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    inviteCode,
                    avatar,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            // Redirect to login page after successful registration
            toast.success('Registration successful! Please log in.');
            router.push('/login?registered=true');
        } catch (err) {
            console.error('Error during registration:', err);
            setError('An unexpected error occurred');
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/login_bg.png)' }}>
            <div className="backdrop-blur-xl p-6 rounded-lg shadow-lg min-w-[350px] border border-gray-300">
                <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
                <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div 
                            className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            {avatar ? (
                                <img
                                    src={avatar}
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
                            Click to upload avatar. Max size: 5MB
                        </p>
                    </div>

                    <div className="relative">
                        <Input
                            type="text"
                            id="name"
                            placeholder="Full Name"
                            className="pl-10"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="relative">
                        <Input
                            type="email"
                            id="email"
                            placeholder="Email"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="relative">
                        <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="relative">
                        <Input
                            type="text"
                            id="inviteCode"
                            placeholder="Invite Code"
                            className="pl-10"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required
                        />
                        <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}