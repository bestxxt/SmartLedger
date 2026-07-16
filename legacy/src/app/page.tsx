'use client';

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; 
    
    if (session) {
      // 用户已登录，跳转到home页面
      router.push('/home');
    } else {
      // 用户未登录，跳转到login页面
      router.push('/login');
    }
  }, [session, status, router]);

  // 在检测用户状态期间显示加载界面
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br text-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br bg-white shadow-lg rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
            <Image src="/logo.png" alt="Smart Ledger Logo" width={48} height={48} className="rounded animate-pulse" />
          </div>
          <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Smart Ledger
          </div>
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      </main>
    );
  }

  
}
