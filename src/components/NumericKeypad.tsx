// components/NumericKeypad.tsx
"use client"

import React, { useEffect, useState } from "react"
import FormattedNumber from '@/components/FormattedNumber'

export interface NumericKeypadProps {
  value: string;
  currencySymbols: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function NumericKeypad({
  value = "0",
  currencySymbols = "$",
  placeholder = "0.00",
  onChange,
}: NumericKeypadProps) {
  const [displayValue, setDisplayValue] = useState(value);

  const updateDisplayValue = (next: string) => {
    setDisplayValue?.(next);
    if (!next.endsWith(".")) {
      onChange?.(next);
    }
  };

  const handleKey = (key: string) => {
    if (key === ".") {
      if (displayValue.includes(".")) return;
      const next = displayValue === "" ? "0." : displayValue + ".";
      return updateDisplayValue(next);
    }
    if (!displayValue.includes(".") && displayValue === "0") {
      // console.log(key);
      return updateDisplayValue(key);
    }
    if (displayValue.includes(".")) {
      const [, dec = ""] = displayValue.split(".");
      if (dec.length >= 2) {
        return;
      }
    }
    updateDisplayValue(displayValue + key);
  };

  const handleAction = (action: "clear" | "back") => {
    if (action === "clear") {
      updateDisplayValue("0");
    }
  };

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Display box */}
      <div className="flex items-center justify-center w-64 h-16 text-4xl font-bold text-gray-700 rounded">
        {currencySymbols[0]}
        {displayValue === "0" ? placeholder : <FormattedNumber value={displayValue} />}
      </div>
      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {["7", "8", "9"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKey(n)}
            className="p-3 w-14 h-14 text-lg border rounded transition active:bg-gray-200"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleAction("clear")}
          className="p-3 w-14 h-14 text-lg border rounded text-blue-600 transition active:bg-gray-200"
        >
          C
        </button>
        {["4", "5", "6"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKey(n)}
            className="p-3 w-14 h-14 text-lg border rounded transition active:bg-gray-200"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKey(".")}
          className="p-3 w-14 h-14 text-lg border rounded transition active:bg-gray-200"
        >
          .
        </button>
        {["1", "2", "3", "0"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKey(n)}
            className="p-3 w-14 h-14 text-lg border rounded transition active:bg-gray-200"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

