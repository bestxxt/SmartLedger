"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react"; // 或你的自定义组件

export default function Example() {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
      },
      {
        root: null, // 默认是 viewport
        threshold: 0.1, // 可视部分大于 10% 就触发
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="h-[100dvh] bg-blue-200 flex flex-col justify-center items-center">
      </div>
      <div className="text-center py-4 flex justify-center items-center h-[32dvh] bg-red-200">
        <Loader className="animate-spin" />
        <div ref={loaderRef} className="h-4"></div>
      </div>

      <p className="text-center mt-4 fixed bottom-[50%] left-0 right-0">
        {isInView ? "已进入视口 👀" : "不在视口中 ❌"}
      </p>
    </>
  );
}
