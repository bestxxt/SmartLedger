'use client';

import { useEffect, useState, useRef } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';

// RegisterBg 组件 - 复用登录页面的背景设计
function RegisterBg() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* 主背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
            
            {/* 动态背景形状 */}
            <div className="absolute inset-0">
                {/* 大圆形背景 - 桌面版 */}
                <div
                    className="absolute -top-40 -right-40 w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 backdrop-blur-3xl"
                />
                
                {/* 中等圆形背景 */}
                <div
                    className="absolute -bottom-32 -left-32 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-purple-400/15 to-pink-400/15 backdrop-blur-3xl"   
                />
                
                {/* 小装饰圆形 */}
                <div
                    className="absolute top-1/4 left-1/4 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 backdrop-blur-2xl"
                />
                
            </div>
            
            {/* 模糊光效 */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatar, setAvatar] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <RegisterBg />
            <main className="min-h-screen flex items-center justify-center p-4">
                <div
                    className="w-full max-w-md"
                >
                    {/* 主注册卡片 */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                        {/* 卡片内部装饰光效 */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-xl" />
                        
                        {/* Logo 和标题区域 */}
                        <div
                            className="text-center mb-8 relative z-10"
                        >
                            <motion.div
                                className="relative inline-block mb-6"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-lg" />
                                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-4 border border-white/40 shadow-lg">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Smart Ledger Logo" 
                                        width={64} 
                                        height={64} 
                                        className="rounded-2xl" 
                                    />
                                </div>
                                <motion.div
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Sparkles className="w-3 h-3 text-white p-0.5" />
                                </motion.div>
                            </motion.div>
                            
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                                Join Smart Ledger
                            </h1>
                            <p className="text-gray-600 text-lg">Create your account</p>
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span>AI-Powered Financial Assistant</span>
                            </div>
                        </div>

                        {/* 注册表单 */}
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit}
                            // initial={{ opacity: 0 }}
                            // animate={{ opacity: 1 }}
                            // transition={{ duration: 0.6, delay: 0.4 }}
                        >


                            {/* 姓名输入框 */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="pl-12 pr-4 py-3 h-14 text-base border-gray-200 rounded-2xl bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 group-hover:border-gray-300"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* 邮箱输入框 */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-12 pr-4 py-3 h-14 text-base border-gray-200 rounded-2xl bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 group-hover:border-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* 密码输入框 */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        className="pl-12 pr-12 py-3 h-14 text-base border-gray-200 rounded-2xl bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 group-hover:border-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 邀请码输入框 */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Invite Code
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Enter invite code"
                                        className="pl-12 pr-4 py-3 h-14 text-base border-gray-200 rounded-2xl bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 group-hover:border-gray-300"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* 错误信息 */}
                            {error && (
                                <motion.div
                                    className="bg-red-50 border border-red-200 rounded-xl p-3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-red-600 text-sm font-medium">{error}</p>
                                </motion.div>
                            )}

                            {/* 注册按钮 */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </motion.div>
                        </form>

                        {/* 登录链接 */}
                        <div
                            className="text-center mt-6 relative z-10"
                            // initial={{ opacity: 0 }}
                            // animate={{ opacity: 1 }}
                            // transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link 
                                    href="/login" 
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}