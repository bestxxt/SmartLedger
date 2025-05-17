'use client';
// components/FormattedNumber.tsx
import React from 'react';

export interface FormattedNumberProps {
  /** The value to be formatted, can be a number or a numeric string */
  value: number | string;
  /** Placeholder to display when the value is empty or not a number */
  placeholder?: string;
  /** Optional additional style classes */
  className?: string;
}

export default function FormattedNumber({
  value,
  placeholder = "0",
  className = "",
}: FormattedNumberProps) {
  const str = value?.toString() ?? "";

  // If the value is empty or not a number, display the placeholder
  if (str === "" || isNaN(Number(str.replace(/,/g, '')))) {
    return <span className={className}>{placeholder}</span>;
  }

  // Split the integer and decimal parts
  const [intPart, decPart] = str.split('.');

  // Format the integer part by adding commas every three digits
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <span className={className}>
      {decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt}
    </span>
  );
}
