'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Github, } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {

  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br text-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-10 pb-20 flex flex-col items-center text-center">
        <div className="flex items-center space-x-3 mb-6 ">
          <div className="w-14 h-14 bg-gradient-to-br bg-white shadow-lg rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
            <Image src="/logo.png" alt="Smart Ledger Logo" width={48} height={48} className="rounded" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Smart Ledger
          </span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-4">
            Your AI accounting assistant
          </span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          AI instantly understands voice, images, and text, auto-tags and tracks your daily finances.
        </motion.p>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <motion.a
            href="https://github.com/your-github-repo" // TODO: 替换为真实仓库地址
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-blue-500 text-blue-600 rounded-xl font-semibold text-lg flex items-center space-x-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          >
            <Github className="w-5 h-5" />
            <span>GitHub Source Code</span>
          </motion.a>
          <motion.button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold text-lg shadow-lg flex items-center space-x-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
          >
            <span>Start Now</span>
            <ArrowRight className="w-5 h-5 animate-pulse border-2 border-white rounded-full" />
          </motion.button>
        </div>
        {/* Mockup 占位图 */}
        <motion.div
          className="w-full flex justify-center mt-6"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        >

          {/* Mockup 横向滚动区块 */}
          <div className="w-[100dvw] flex justify-center mt-6">
            <div className="overflow-x-auto scrollbar-hide w-full px-2">
              <div className="flex flex-row gap-4 min-w-max py-2 px-5">
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/Home.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0"
                    priority
                  />
                </div>
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/HomeCard.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0"
                    priority
                  />
                </div>
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/Adding.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0 "
                    priority
                  />
                </div>
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/Setting.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0"
                    priority
                  />
                </div>
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/Speech.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0"
                    priority
                  />
                </div>
                <div className="relative w-[320px] h-[640px]">
                  <Image
                    src="/mock/Picture.png"
                    alt="iPhone Mockup"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="pointer-events-none select-none z-0"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section - 功能亮点 */}
      {/* TODO: 实现功能亮点区块 */}
      {/* Screenshots Section - 界面展示 */}
      {/* TODO: 实现滑动 mockup 组件 */}
      {/* How It Works Section - 如何使用 */}
      {/* TODO: 实现三步流程区块 */}
      {/* Personalization Section - 个性化与设置 */}
      {/* TODO: 实现设置界面展示 */}
      {/* Tech & Security Section - 技术亮点/安全性 */}
      {/* TODO: 实现技术亮点区块 */}
      {/* Footer */}
      {/* TODO: 实现页脚 */}
    </main>
  );
}
