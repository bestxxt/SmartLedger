import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// 定义所有的 income 类别数组
export const category_income = [
  'Salary',
  'Investment',
  'Business',
  'Rental',
  'Freelance',
  'Dividends',
  'Gifts',
  'Grants',
  'Royalties',
  'Other'
];

// 定义所有的 expense 类别数组
export const category_expense = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Clothing',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Other'
];