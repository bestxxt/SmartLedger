// components/NumericKeypad.tsx
"use client"

import React, { useState } from "react"
import FormattedNumber from '@/components/FormattedNumber'

export interface NumericKeypadProps {
  /** Initial value as a string */
  initialValue?: string
  /** Optional array of currency symbols, default is ["$"] */
  currencySymbols?: string
  /** Placeholder displayed when value is empty */
  placeholder?: string
  /** Callback when value changes, passing the current string */
  onChange?: (value: string) => void
}

export default function NumericKeypad({
  initialValue = "",
  currencySymbols = "$",
  placeholder = "0.00",
  onChange,
}: NumericKeypadProps) {
  const [value, setValue] = useState<string>(initialValue)

  const updateValue = (next: string) => {
    setValue(next)
    onChange?.(next)
  }

  const handleKey = (key: string) => {
    // Handle decimal point
    if (key === ".") {
      if (value.includes(".")) return      // Ignore if a decimal point already exists
      const next = value === "" ? "0." : value + "."
      return updateValue(next)
    }

    // Handle numeric keys
    // If the current value is purely "0" (and no decimal yet), overwrite with the new number
    if (!value.includes(".") && value === "0") {
      return updateValue(key)
    }

    // If a decimal point exists and the decimal part length is already >=2, do not add more
    if (value.includes(".")) {
      const [, dec = ""] = value.split(".")
      if (dec.length >= 2) {
        return
      }
    }

    // In other cases, just append the number
    updateValue(value + key)
  }


  const handleAction = (action: "clear" | "back") => {
    if (action === "clear") {
      updateValue("0")
    } else if (action === "back") {
      updateValue(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Display box */}
      <div className="flex items-center justify-center w-64 h-16 text-4xl font-bold text-gray-700 rounded">
        {currencySymbols[0]}
        {value === "0" ? placeholder : <FormattedNumber value={value}/>}
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
  )
}
