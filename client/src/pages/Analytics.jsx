import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiBarChart2, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import API from '../services/api';
import MonthlyChart from '../components/charts/MonthlyChart';
import { SkeletonGrid } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, monthName } from '../utils/format';
import { CHART_OPTIONS, PAYMENT_METHODS, CURRENCY_SYMBOLS } from '../utils/constants';

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  const now = new Date();
  const [chartType, setChartType] = useState('bar');
  const [monthly, setMonthly] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const monthlyRes = await API.get('/analytics/monthly', { params: { year: now.getFullYear() } });
        setMonthly(monthlyRes.data.data);

        const categoryRes = await API.get('/analytics/categories', { params: { month: now.getMonth() + 1, year: now.getFullYear() } });
        setBreakdown(categoryRes.data.data);

        const paymentRes = await API.get('/analytics/payment-methods', {
          params: { month: now.getMonth() + 1, year: now.getFullYear() },
        });
        setPaymentMethods(paymentRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={3} />
        <SkeletonGrid count={2} />
      </div>
    );
  }

  const yearIncome = monthly.reduce((sum, item) => sum + item.income, 0);
  const yearExpense = monthly.reduce((sum, item) => sum + item.expense, 0);
  const yearSavings = yearIncome - yearExpense;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted">{now.getFullYear()} overview</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Analytics</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card card-hover p-5">
          <p className="section-title">Income</p>
          <p className="stat-value mt-2 text-accent">{formatCurrency(yearIncome, currency)}</p>
        </div>
        <div className="card card-hover p-5">
          <p className="section-title">Expenses</p>
          <p className="stat-value mt-2 text-red-600">{formatCurrency(yearExpense, currency)}</p>
        </div>
        <div className="card card-hover p-5">
          <p className="section-title">Savings</p>
          <p className="stat-value mt-2">{formatCurrency(yearSavings, currency)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid lg:grid-cols-[200px_1fr]">
          <div className="border-b border-line p-4 lg:border-b-0 lg:border-r">
            <p className="section-title mb-3">Chart type</p>
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {CHART_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs transition duration-150 ${
                    chartType === option.value
                      ? 'bg-primary font-semibold text-onprimary shadow-soft'
                      : 'text-muted hover:bg-sage hover:text-ink'
                  }`}
                >
                  <FiBarChart2 size={14} />
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-4 hidden text-[11px] leading-relaxed text-muted lg:block">
              Pick an option — the chart changes instantly for the same data.
            </p>
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="section-title">Income vs expense by month</p>
              <span className="chip">{CHART_OPTIONS.find((option) => option.value === chartType)?.label}</span>
            </div>
            <div className="h-72">
              <MonthlyChart type={chartType} data={monthly} currencySymbol={symbol} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiPieChart size={14} className="text-accent" />
            <p className="section-title">Spending breakdown · {monthName(now.getMonth() + 1)}</p>
          </div>
          {breakdown.length === 0 ? (
            <EmptyState title="No spending this month" message="Expenses will appear here once you add them." />
          ) : (
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item._id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span> {item.name}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.total, currency)} · {Math.round(item.percentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp size={14} className="text-accent" />
            <p className="section-title">Payment methods · {monthName(now.getMonth() + 1)}</p>
          </div>
          {paymentMethods.length === 0 ? (
            <EmptyState title="No activity" message="Payment method usage will show up here." />
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((item) => (
                <div key={item.method} className="flex items-center justify-between border-b border-line pb-2 text-xs last:border-0">
                  <span className="text-muted">
                    {(PAYMENT_METHODS.find((method) => method.value === item.method) || {}).label || item.method}
                  </span>
                  <span>
                    <span className="font-semibold">{formatCurrency(item.total, currency)}</span>
                    <span className="ml-2 text-muted">{item.count} tx</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
