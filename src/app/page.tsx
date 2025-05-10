'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie.includes('access_token');
    if (!hasCookie) {
      router.push('/login');
    }
    router.push('/home');
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Finance
            </h1>
            <p className="text-gray-600">
              Your intelligent financial companion
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    </main>
  );
}
