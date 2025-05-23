'use client';

import { useEffect, useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// LoginBg 组件
function LoginBg() {
    return (
        <div
            style={{
                background: "linear-gradient(135deg, #a9c6ff 0%, #062b74 100%)",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
                overflow: "hidden",
            }}
        >
            {/* Top Right SVG */}
            <svg
                style={{
                    position: "absolute",
                    right: "-200px",
                    top: "-400px",
                    width: "600px",
                    height: "600px",
                }}
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="300" cy="300" r="300" fill="#fff" fillOpacity="0.15" />
            </svg>
            {/* Bottom Left SVG */}
            <svg
                style={{
                    position: "absolute",
                    left: "-200px",
                    bottom: "-300px",
                    width: "500px",
                    height: "500px",
                }}
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="250" cy="250" r="250" fill="#fff" fillOpacity="0.10" />
            </svg>
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const session = await getSession();
            if (session) {
                router.push('/home');
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);


        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                return;
            }
            // Optionally, you can use toast notifications for success
            toast.success('Login successful!');
            // router.push('/home');
            // Force immediate redirect
            window.location.href = '/home';
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoginBg />
            <main className="flex items-center justify-center min-h-screen ">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full mx-4 sm:min-w-[450px] sm:w-auto border border-gray-300">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative mb-4">
                            <Image 
                                src="/logo.png" 
                                alt="Smart Ledger Logo" 
                                width={72} 
                                height={72} 
                                className="rounded-2xl border border-gray-200 p-2 shadow-sm transition-all hover:shadow-md" 
                            />
                        </div>
                        <h1 className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Welcome to Smart Ledger
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
                    </div>
                    <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Input
                                type="email"
                                id="email"
                                placeholder="Email"
                                className="pl-10 h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Password"
                                className="pl-10 h-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-between text-sm ">
                            {/* remember me checkbox */}
                            <div className="flex items-center">
                                <Checkbox id="remember-me" className="mr-2" />
                                <label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</label>
                            </div>
                            {/* forgot password */}
                            <Link href="/forgot-password" className="text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                    {/* Split line */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="w-full h-[1px] bg-gray-300"></div>
                        <span className="text-gray-500 mx-4">OR</span>
                        <div className="w-full h-[1px] bg-gray-300"></div> 
                    </div>
                    {/* Google login */}
                    <div className="flex items-center justify-center mt-4">
                        <Image src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" alt="Google Logo" width={20} height={20} className="w-10 h-10 border border-gray-300 rounded-full p-1" onClick={() => {
                            console.log('Google login');
                        }} />
                    </div>

                </div>
            </main>
        </>
    );
}
