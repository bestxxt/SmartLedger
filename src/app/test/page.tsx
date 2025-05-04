"use client";

import React, { useEffect, useRef } from "react";
import { WavRecorder } from "webm-to-wav-converter";

export default function App() {
  const recorderRef = useRef<InstanceType<typeof WavRecorder> | null>(null);

  useEffect(() => {
    recorderRef.current = new WavRecorder();
  }, []);

  const startRecording = () => {
    recorderRef.current?.start();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const download16Bit = () => {
    recorderRef.current?.download();
  };

  const download32Bit = () => {
    recorderRef.current?.download("MyWAVFile", true);
  };

  return (
    <div className="p-8 text-center space-y-4">
      <h1 className="text-2xl font-semibold">WavRecorder Class Usage</h1>

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
        onClick={startRecording}
      >
        Start
      </button>
      <br />

      <button
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
        onClick={stopRecording}
      >
        Stop
      </button>
      <br />

      <button
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
        onClick={download16Bit}
      >
        Download 16-bit WAV
      </button>
      <br />

      <button
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded"
        onClick={download32Bit}
      >
        Download 32-bit WAV
      </button>
    </div>
  );
}
