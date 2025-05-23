// src/app/test/page.tsx
'use client';

import { useState } from "react";

type Message = {
  from: 'user' | 'agent';
  text: string;
};

export default function TestChat() {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'agent', text: 'Hi, how can I help you today?' },
    { from: 'user', text: "Hey, I'm having trouble with my account." },
    { from: 'agent', text: 'What seems to be the problem?' },
    { from: 'user', text: "I can't log in." },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <img
            src="https://api.dicebear.com/7.x/micah/svg?seed=sofia"
            alt="avatar"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="font-semibold">Sofia Davis</div>
            <div className="text-xs text-gray-500">m@example.com</div>
          </div>
          <button className="ml-auto w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100">
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
        {/* Chat messages */}
        <div className="space-y-2 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
                  msg.from === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="flex items-center border-t pt-2">
          <input
            className="flex-1 border-none outline-none bg-transparent px-2 py-2 text-sm"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            className="ml-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={handleSend}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}