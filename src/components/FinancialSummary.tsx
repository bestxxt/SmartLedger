import { Loader, ArrowUp, ArrowDown } from 'lucide-react';
import { User } from '@/models/user';

type FinancialSummaryProps = {
  loading: boolean;
  user: User | null;
};

export default function FinancialSummary({ loading, user}: FinancialSummaryProps) {
  if (loading || !user) {
    return (
      <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col p-4">
          <h3 className="text-gray-700 font-medium mb-3">Financial Summary</h3>
          <div className="w-full h-8 bg-gray-100 rounded-full mb-4 overflow-hidden flex">
            <div className="w-full flex items-center justify-center">
              <Loader className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Income</span>
                <span className="bg-green-100 p-1 rounded-full">
                  <ArrowUp className="text-green-600" />
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <Loader className="h-4 w-4 animate-spin text-green-600 mr-2" />
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
                <Loader className="h-4 w-4 animate-spin text-red-600 mr-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const incomeWidth = user.stats.balance !== 0 ? `${((user.stats.totalIncome / (user.stats.totalIncome + user.stats.totalExpense)) * 100).toFixed(2)}%` : '50%';
  const expensesWidth = user.stats.balance !== 0 ? `${((user.stats.totalExpense / (user.stats.totalIncome + user.stats.totalExpense)) * 100).toFixed(2)}%` : '50%';

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col p-4">
        <h3 className="text-gray-700 font-medium mb-3">Financial Summary</h3>

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
              ${user.stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              ${user.stats.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}