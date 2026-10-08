import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiDownload, FiTrendingDown, FiTrendingUp, FiMinus } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../services/api';
import { SkeletonGrid } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency, monthName } from '../utils/format';
import { CURRENCY_SYMBOLS } from '../utils/constants';

const tooltipStyle = {
  backgroundColor: '#29231F',
  color: '#FAF8F3',
  border: 'none',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: '"JetBrains Mono", monospace',
};

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get('/analytics/reports', { params: { month, year } });
        setReport(res.data.data);
      } catch (error) {
        setReport(null);
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month, year]);

  const changeMonth = (step) => {
    const date = new Date(year, month - 1 + step, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  };

  const exportCsv = async () => {
    try {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const res = await API.get('/transactions/csv', {
        responseType: 'blob',
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${year}-${String(month).padStart(2, '0')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={4} />
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (!report) {
    return <EmptyState title="Report unavailable" message="Could not load this month's report." />;
  }

  const expenseDiff = report.change.expensePercent;
  const comparison =
    expenseDiff < -0.5
      ? `You spent ${Math.abs(Math.round(expenseDiff))}% less than last month.`
      : expenseDiff > 0.5
        ? `You spent ${Math.round(expenseDiff)}% more than last month.`
        : 'Your spending is almost the same as last month.';

  const ComparisonIcon = expenseDiff < -0.5 ? FiTrendingDown : expenseDiff > 0.5 ? FiTrendingUp : FiMinus;
  const comparisonColor = expenseDiff < -0.5 ? 'text-accent' : expenseDiff > 0.5 ? 'text-red-600' : 'text-muted';

  const breakdownData = report.categories.map((item) => ({ name: item.name, value: item.total, color: item.color }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Monthly report</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {monthName(month)} {year}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => changeMonth(-1)} className="btn-outline btn-sm">
              ←
            </button>
            <button onClick={() => changeMonth(1)} className="btn-outline btn-sm">
              →
            </button>
          </div>
        </div>
        <button onClick={exportCsv} className="btn-outline">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className={`card flex items-center gap-4 border-l-4 p-5 ${expenseDiff <= 0 ? 'border-l-accent' : 'border-l-red-500'}`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-sage ${comparisonColor}`}>
          <ComparisonIcon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold">{comparison}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {monthName(month)}: {formatCurrency(report.current.expense, currency)} · {monthName(report.month === 1 ? 12 : report.month - 1)}:{' '}
            {formatCurrency(report.previous.expense, currency)}
          </p>
        </div>
      </div>

      <div>
        <p className="section-title mb-3">Monthly overview</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card card-hover p-5">
            <p className="section-title">Income</p>
            <p className="stat-value mt-2 text-accent">{formatCurrency(report.current.income, currency)}</p>
            <p className="mt-1 text-[11px] text-muted">
              {report.change.incomePercent >= 0 ? '+' : ''}
              {Math.round(report.change.incomePercent)}% vs last
            </p>
          </div>
          <div className="card card-hover p-5">
            <p className="section-title">Expenses</p>
            <p className="stat-value mt-2 text-red-600">{formatCurrency(report.current.expense, currency)}</p>
            <p className={`mt-1 text-[11px] ${expenseDiff > 0 ? 'text-red-600' : 'text-accent'}`}>
              {expenseDiff >= 0 ? '+' : ''}
              {Math.round(expenseDiff)}% vs last
            </p>
          </div>
          <div className="card card-hover p-5">
            <p className="section-title">Net savings</p>
            <p className="stat-value mt-2">{formatCurrency(report.current.savings, currency)}</p>
            <p className="mt-1 text-[11px] text-muted">last: {formatCurrency(report.previous.savings, currency)}</p>
          </div>
          <div className="card card-hover p-5">
            <p className="section-title">Transactions</p>
            <p className="stat-value mt-2">{report.current.count}</p>
            <p className="mt-1 text-[11px] text-muted">last: {report.previous.count}</p>
          </div>
          <div className="card card-hover p-5">
            <p className="section-title">Avg / day</p>
            <p className="stat-value mt-2">{formatCurrency(report.current.avgDaily, currency)}</p>
            <p className="mt-1 text-[11px] text-muted">daily spend</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card p-5 lg:col-span-7">
          <p className="section-title mb-4">Income vs expenses · last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.sixMonths} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} width={65} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${symbol}${Number(value).toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }} />
                <Bar dataKey="income" name="Income" fill="#78816A" radius={[5, 5, 0, 0]} animationDuration={250} />
                <Bar dataKey="expense" name="Expense" fill="#C2703D" radius={[5, 5, 0, 0]} animationDuration={250} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-5">
          <p className="section-title mb-2">Spending breakdown</p>
          {breakdownData.length === 0 ? (
            <EmptyState title="No expenses" message="Nothing to break down this month." />
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} animationDuration={250}>
                    {breakdownData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${symbol}${Number(value).toLocaleString('en-IN')}`} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card overflow-hidden lg:col-span-7">
          <div className="border-b border-line px-5 py-4">
            <p className="section-title">Category analysis</p>
          </div>
          {report.categories.length === 0 ? (
            <EmptyState title="No category data" message="Add expenses to see category analysis." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr>
                    <th className="table-th">Category</th>
                    <th className="table-th text-right">This month</th>
                    <th className="table-th text-right">Last month</th>
                    <th className="table-th text-right">Change</th>
                    <th className="table-th text-right">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categories.map((item) => (
                    <tr key={item._id} className="row-hover">
                      <td className="table-td">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.icon} {item.name}
                        </span>
                      </td>
                      <td className="table-td text-right font-medium">{formatCurrency(item.total, currency)}</td>
                      <td className="table-td text-right text-muted">{formatCurrency(item.previousTotal, currency)}</td>
                      <td className={`table-td text-right ${item.changePercent > 0 ? 'text-red-600' : 'text-accent'}`}>
                        {item.changePercent > 0 ? '+' : ''}
                        {Math.round(item.changePercent)}%
                      </td>
                      <td className="table-td text-right text-muted">{Math.round(item.percentage)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="card p-5">
            <p className="section-title mb-4">Top spending categories</p>
            {report.topCategories.length === 0 ? (
              <p className="text-xs text-muted">No expenses this month.</p>
            ) : (
              <div className="space-y-3">
                {report.topCategories.map((item, index) => (
                  <div key={item._id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">{String(index + 1).padStart(2, '0')}</span>
                        {item.icon} {item.name}
                      </span>
                      <span className="font-semibold">{formatCurrency(item.total, currency)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${report.topCategories[0].total > 0 ? (item.total / report.topCategories[0].total) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="section-title mb-3">Payment methods</p>
            {report.paymentMethods.length === 0 ? (
              <p className="text-xs text-muted">No activity this month.</p>
            ) : (
              <div className="space-y-2">
                {report.paymentMethods.map((item) => (
                  <div key={item.method} className="flex items-center justify-between border-b border-line pb-2 text-xs last:border-0">
                    <span className="uppercase text-muted">{item.method.replace('_', ' ')}</span>
                    <span className="font-medium">
                      {formatCurrency(item.total, currency)} · {Math.round(item.percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
