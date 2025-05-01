'use client';

import { Input } from '@/components/ui/input';
import { Button} from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"
import { User, Key } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/account/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Login failed');
                return;
            }

            const data = await response.json();
            console.log('Login successful:', data);
            router.push('/home'); // Redirect to dashboard or another page
        } catch (err) {
            console.error('Error during login:', err);
            setError('An unexpected error occurred');
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/login_bg.png)' }}>
            <div className="backdrop-blur-xl p-6 rounded-lg shadow-lg min-w-[350px] border border-gray-300">
                <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
                <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
                    <div className="relative">
                        <Input
                            type="text"
                            id="username"
                            placeholder="Email"
                            className="pl-10"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="relative">
                        <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remember me
                            </label>
                        </div>
                        <a href="#" className="text-sm hover:underline">Forgot password?</a>
                    </div>
                    <Button type="submit" className="w-full">
                        Log In
                    </Button>
                </form>
            </div>
        </main>
    );
}
