'use client';

import { Input } from '@/components/ui/input';
import { Button} from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"
import { User, Key } from 'lucide-react';

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/login_bg.png)' }}>
            <div className="backdrop-blur-xl p-6 rounded-lg shadow-lg min-w-[350px] border border-gray-300">
                <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
                <form className="space-y-4 w-full max-w-sm">
                    <div className="relative">
                        <Input type="text" id="username" placeholder="Username" className="pl-10" />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                    <div className="relative">
                        <Input type="password" id="password" placeholder="Password" className="pl-10" />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
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
