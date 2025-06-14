'use client';
import FormattedNumber from '@/components/FormattedNumber';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useUserStore } from '@/store/useUserStore';

export default function CurrentBalance() {
  const { user, user_loading } = useUserStore();

  if (!user) {
    return (
      <div className="bg-white p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 mb-2 rounded bg-gray-200" />
          <Skeleton className="h-10 w-40 mb-1 rounded bg-gray-200" />
          <Skeleton className="h-4 w-24 rounded bg-gray-100" />
        </div>
        <div className="mt-6 h-23 w-full">
          <Skeleton className="h-full w-full rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const currencySymbol = user.currency === 'CNY' ? '¥' :
    user.currency === 'EUR' ? '€' :
      user.currency === 'GBP' ? '£' : '$';

  // Fetch the balance data for the last 8 months
  const chartData = user.stats.monthlyBalances || [];
  // Month-over-month growth rate
  const last = chartData[chartData.length - 1]?.balance || 0;
  const prev = chartData[chartData.length - 2]?.balance || 0;
  const growth = prev === 0 ? 0 : ((last - prev) / Math.abs(prev)) * 100;
  // console.log(chartData);
  return (
    <div className="bg-white p-6">
      <div className="space-y-1">
        <div className="text-gray-700 text-base font-medium">Total Balance</div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-black">{currencySymbol}<FormattedNumber value={last.toFixed(2)} /></span>
        </div>
        <div className="text-sm text-gray-500">
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from last month
        </div>
      </div>
      <div className="mt-4 w-full h-[80%]">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData} margin={{ left: 15, right: 15, top: 5, bottom: 0 }}>
            <XAxis
              dataKey="month"
              hide={false}
              tick={{ fontSize: 12, fill: "#888" }}
              tickLine={true}
              axisLine={true}
              tickFormatter={m => {
                // m: "2024-05"
                const monthNum = Number(m.split('-')[1]);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                // console.log("month", monthNum, months[monthNum - 1]);
                return months[monthNum - 1];
                // return '1234';
              }}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} labelFormatter={() => ''} />
            <Line type="monotone" dataKey="balance" stroke="#111" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#111', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}