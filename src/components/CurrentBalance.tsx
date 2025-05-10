import { Loader } from 'lucide-react';
import { format } from 'date-fns';
import FormattedNumber from '@/components/FormattedNumber';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

type CurrentBalanceProps = {
  loading: boolean;
  balance: number;
  user: User | null;
};

export default function CurrentBalance({ loading, balance, user }: CurrentBalanceProps) {
  const currencySymbol = user?.currency === 'CNY' ? '¥' : 
                        user?.currency === 'EUR' ? '€' : 
                        user?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wider">Current Balance</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-gray-500 text-3xl">Loading...</span>
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className={cn(
                "text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600",
                user?.currency === 'CNY' && "text-2xl md:text-3xl"
              )}>
                {currencySymbol}
              </span>
              <span className={cn(
                "text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600",
                user?.currency === 'CNY' && "text-2xl md:text-3xl"
              )}>
                <FormattedNumber value={balance.toFixed(2)} />
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500">Updated {format(new Date(), 'h:mm')}</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-md">
          {user ? (
            <img
              src={user.avatar}
              alt={`${user.name}'s Avatar`}
              className="w-14 h-14 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user.name)}`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-14 h-14">
              <Loader className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}