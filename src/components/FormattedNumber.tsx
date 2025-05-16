'use client';
// components/FormattedNumber.tsx
import React from 'react';

export interface FormattedNumberProps {
  /** 要格式化的数值，可以是数字或数字字符串 */
  value: number | string;
  /** 当 value 为空或非数字时显示的占位符 */
  placeholder?: string;
  /** 可选的额外样式类 */
  className?: string;
}

export default function FormattedNumber({
  value,
  placeholder = "0",
  className = "",
}: FormattedNumberProps) {
  const str = value?.toString() ?? "";

  // 如果为空或非数字，则显示占位符
  if (str === "" || isNaN(Number(str.replace(/,/g, '')))) {
    return <span className={className}>{placeholder}</span>;
  }

  // 拆分整数和小数部分
  const [intPart, decPart] = str.split('.');

  // 格式化整数部分，每三位加逗号
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <span className={className}>
      {decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt}
    </span>
  );
}
