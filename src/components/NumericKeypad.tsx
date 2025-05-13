// components/NumericKeypad.tsx
"use client"

import React, { useState } from "react"
import FormattedNumber from '@/components/FormattedNumber'

export interface NumericKeypadProps {
  /** 初始值，作为字符串 */
  initialValue?: string
  /** 可选货币符号数组，默认 ["$"] */
  currencySymbols?: string
  /** 占位符，value 为空时显示 */
  placeholder?: string
  /** 值变化时回调，传递当前字符串 */
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
    // 处理小数点
    if (key === ".") {
      if (value.includes(".")) return      // 已有小数点就忽略
      const next = value === "" ? "0." : value + "."
      return updateValue(next)
    }

    // 处理数字键
    // 如果当前值是纯 "0"（且还没小数），再输入数字就直接覆盖
    if (!value.includes(".") && value === "0") {
      return updateValue(key)
    }

    // 如果已有小数点且小数部分长度已 >=2，就不再添加
    if (value.includes(".")) {
      const [, dec = ""] = value.split(".")
      if (dec.length >= 2) {
        return
      }
    }

    // 其它情况直接累加
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
      {/* 显示框 */}
      <div className="flex items-center justify-center w-64 h-16 text-4xl font-bold text-gray-700 rounded">
        {currencySymbols[0]}
        {value === "0" ? placeholder : <FormattedNumber value={value}/>}
      </div>

      {/* 键盘 */}
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
