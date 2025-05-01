'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie.includes('access_token');
    console.log('Cookie:', document.cookie);
    if (!hasCookie) {
      router.push('/login');
    }
    router.push('/home');
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">欢迎使用</h2>
        <p className="mt-4 text-center">请登录以继续</p>
      </div>
    </main>
  );
}
