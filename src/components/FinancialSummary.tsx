'use client';

import { Loader, ArrowUp, ArrowDown } from 'lucide-react';
import { User } from '@/models/user';
import { cn } from '@/lib/utils';
import FormattedNumber from '@/components/FormattedNumber';
import { Skeleton } from "@/components/ui/skeleton"


type FinancialSummaryProps = {
  loading: boolean;
  user: User | null;
};

export default function FinancialSummary({ loading, user}: FinancialSummaryProps) {
  if (loading || !user) {
    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col p-4">
          <Skeleton className="h-8 w-full from-green-300 to-red-300 bg-gradient-to-r rounded-full mb-4 overflow-hidden flex" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Income</span>
                <span className="bg-green-100 p-1 rounded-full">
                  <ArrowUp className="text-green-600" />
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <Skeleton className="h-6 w-full bg-green-300" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600 font-medium">Expenses</span>
                <span className="bg-red-100 p-1 rounded-full">
                  <ArrowDown className="text-red-600" />
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <Skeleton className="h-6 w-full bg-red-300 " />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currencySymbol = user.currency === 'CNY' ? '¥' : 
                        user.currency === 'EUR' ? '€' : 
                        user.currency === 'GBP' ? '£' : '$';

  const incomeWidth = user.stats.balance !== 0 ? `${((user.stats.totalIncome / (user.stats.totalIncome + user.stats.totalExpense)) * 100).toFixed(2)}%` : '50%';
  const expensesWidth = user.stats.balance !== 0 ? `${((user.stats.totalExpense / (user.stats.totalIncome + user.stats.totalExpense)) * 100).toFixed(2)}%` : '50%';

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col p-4">
        {/* Comparison Bar */}
        <div className="w-full h-8 bg-gray-100 rounded-full mb-4 overflow-hidden flex">
          <div className="h-full bg-green-400 flex items-center justify-center text-xs font-medium text-white" style={{ width: incomeWidth }}>
            {parseInt(incomeWidth) > 15 && `${parseInt(incomeWidth)}%`}
          </div>
          <div className="h-full bg-red-400 flex items-center justify-center text-xs font-medium text-white" style={{ width: expensesWidth }}>
            {parseInt(expensesWidth) > 15 && `${parseInt(expensesWidth)}%`}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">Income</span>
              <span className="bg-green-100 p-1 rounded-full">
                <ArrowUp className="text-green-600" />
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              <span className={cn(
                user.currency === 'CNY' && "text-base"
              )}>
                {currencySymbol}
              </span>
              <FormattedNumber value={user.stats.totalIncome.toFixed(2)} />
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 font-medium">Expenses</span>
              <span className="bg-red-100 p-1 rounded-full">
                <ArrowDown className="text-red-600" />
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1">
              <span className={cn(
                user.currency === 'CNY' && "text-base"
              )}>
                {currencySymbol}
              </span>
              <FormattedNumber value={user.stats.totalExpense.toFixed(2)} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}