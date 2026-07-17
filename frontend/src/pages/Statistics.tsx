import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

// Theme Colors from Tailwind Config
const COLORS = ['#1A1A1A', '#5A6050', '#C24D38', '#A23927', '#4A5040'];
const CHART_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export default function Statistics() {
  const { isAuthenticated, fetchUser } = useUserStore();
  const { transactions, fetchTransactions, isLoading: isTxLoading } = useTransactionStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUser();
      fetchTransactions();
    }
  }, [isAuthenticated, navigate]);

  // Compute Data for Pie Chart (Expense by Category)
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [transactions]);

  // Compute Data for Bar Chart (Last 6 Months Income/Expense)
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expense: number }> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[yearMonth] = { month: monthStr, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.timestamp);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      if (months[yearMonth]) {
        if (t.type === 'income') {
          months[yearMonth].income += t.amount;
        } else {
          months[yearMonth].expense += t.amount;
        }
      }
    });

    return Object.values(months);
  }, [transactions]);

  return (
    <>
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full relative">
        <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold font-serif italic">Statistical Report</h2>
            <p className="text-ink-light font-mono uppercase tracking-widest text-xs mt-2 font-bold">
              Visual Data Analysis
            </p>
          </div>
        </header>

        {isTxLoading ? (
          <div className="p-8 text-center font-mono text-ink-light animate-pulse">Compiling charts...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pie Chart: Expenses by Category */}
            <div className="neo-box p-6 bg-white flex flex-col">
              <h3 className="text-xl font-serif font-bold italic mb-6 border-b-2 border-ink pb-2">Outflow by Classification</h3>
              {expenseByCategory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center font-mono text-ink-light text-sm p-10 border-2 border-dashed border-ink/30 m-4">
                  No expenditure records available.
                </div>
              ) : (
                <>
                  <div className="h-72 w-full mt-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          stroke="#1A1A1A"
                          strokeWidth={2}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseByCategory.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#F4F1EA', border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'Courier New, monospace' }}
                          itemStyle={{ color: '#1A1A1A', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-mono font-bold uppercase tracking-wider">
                    {expenseByCategory.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-ink" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bar Chart: Last 6 Months */}
            <div className="neo-box p-6 bg-white flex flex-col">
              <h3 className="text-xl font-serif font-bold italic mb-6 border-b-2 border-ink pb-2">Semi-Annual Trajectory</h3>
              
              <div className="h-72 w-full mt-4 flex-1 min-w-0 -ml-4 sm:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }}
                      tick={{ fill: '#1A1A1A', fontFamily: CHART_FONT, fontWeight: 'bold', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={{ stroke: '#1A1A1A', strokeWidth: 2 }}
                      tickLine={{ stroke: '#1A1A1A', strokeWidth: 2 }}
                      tick={{ fill: '#1A1A1A', fontFamily: CHART_FONT, fontWeight: 'bold', fontSize: 10 }}
                      tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(1).replace('.0','')}k` : `$${value}`}
                      width={45}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F4F1EA' }}
                      contentStyle={{ backgroundColor: '#F4F1EA', border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'Courier New, monospace' }}
                      itemStyle={{ color: '#1A1A1A', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontFamily: CHART_FONT, fontWeight: 'bold', fontSize: 12, paddingTop: '10px' }}
                      iconType="square"
                    />
                    <Bar dataKey="income" name="Inflow" fill="#5A6050" stroke="#1A1A1A" strokeWidth={2} />
                    <Bar dataKey="expense" name="Outflow" fill="#C24D38" stroke="#1A1A1A" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </main>
    </>
  );
}
