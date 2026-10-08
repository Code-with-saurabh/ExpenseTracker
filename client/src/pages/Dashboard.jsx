import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiPlus, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { SkeletonGrid } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';

const TooltipStyle = {
  backgroundColor: '#29231F',
  color: '#FAF8F3',
  border: 'none',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: '"JetBrains Mono", monospace',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const currency = user ? user.currency : 'INR';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/analytics/dashboard');
        setData(res.data.data);
      } catch (error) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={4} />
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (!data) {
    return <EmptyState title="Could not load dashboard" message="Something went wrong while loading your data." />;
  }

  const hasAnyTransaction = data.totalIncome > 0 || data.totalExpense > 0;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const monthlySeries = [
    { name: 'Income', value: data.monthlyIncome },
    { name: 'Expense', value: data.monthlyExpense },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted">{formatDate(new Date())}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {greeting}, {user ? user.name.split(' ')[0] : ''}
          </h2>
        </div>
        <button onClick={() => navigate('/transactions?new=1')} className="btn-primary">
          <FiPlus size={15} /> Add transaction
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card card-hover relative overflow-hidden bg-beige p-6 lg:col-span-7">
          <p className="section-title">Total balance</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight">{formatCurrency(data.balance, currency)}</p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted">All income</p>
              <p className="mt-1 text-sm font-semibold text-accent">{formatCurrency(data.totalIncome, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted">All expense</p>
              <p className="mt-1 text-sm font-semibold text-red-600">{formatCurrency(data.totalExpense, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted">This month</p>
              <p className="mt-1 text-sm font-semibold">{formatCurrency(data.monthlySavings, currency)}</p>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-line opacity-40" />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="section-title">Income this month</p>
              <p className="mt-2 text-xl font-semibold text-accent">{formatCurrency(data.monthlyIncome, currency)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-accent">
              <FiArrowUpRight size={18} />
            </div>
          </div>
          <div className="card card-hover flex items-center justify-between p-5">
            <div>
              <p className="section-title">Expense this month</p>
              <p className="mt-2 text-xl font-semibold text-red-600">{formatCurrency(data.monthlyExpense, currency)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-red-600">
              <FiArrowDownRight size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card p-5 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="section-title">This month at a glance</p>
            <Link to="/analytics" className="text-[11px] text-accent underline-offset-4 hover:underline">
              Open analytics
            </Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries} barCategorySize="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(120,129,106,0.08)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={250}>
                  <Cell fill="#78816A" />
                  <Cell fill="#C2703D" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-4">
          <p className="mb-3 section-title">Spending by category</p>
          {data.categoryBreakdown.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">No expenses this month.</p>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryBreakdown} dataKey="total" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={2} animationDuration={250}>
                      {data.categoryBreakdown.map((entry) => (
                        <Cell key={entry._id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {data.categoryBreakdown.slice(0, 4).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <span className="font-medium">{Math.round(entry.percentage)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card p-5 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="section-title">Budget status</p>
            <Link to="/budgets" className="text-[11px] text-accent underline-offset-4 hover:underline">
              Manage
            </Link>
          </div>
          {data.budgetStatus.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              message="Set a monthly limit for a category."
              actionLabel="Create budget"
              onAction={() => navigate('/budgets')}
            />
          ) : (
            <div className="space-y-4">
              {data.budgetStatus.map((item) => (
                <div key={item._id}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span>{item.category ? item.category.icon : '·'}</span>
                      {item.category ? item.category.name : ''}
                    </span>
                    <span className="text-muted">
                      {formatCurrency(item.spent, currency)} / {formatCurrency(item.budget, currency)}
                    </span>
                  </div>
                  <ProgressBar percentage={item.percentage} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden lg:col-span-7">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="section-title">Recent transactions</p>
            <Link to="/transactions" className="text-[11px] text-accent underline-offset-4 hover:underline">
              View all
            </Link>
          </div>
          {!hasAnyTransaction ? (
            <EmptyState
              title="No transactions yet"
              message="Start tracking your first expense."
              actionLabel="Add your first expense"
              onAction={() => navigate('/transactions?new=1')}
            />
          ) : (
            <div>
              {data.recentTransactions.map((item) => (
                <div key={item._id} className="row-hover flex items-center justify-between border-b border-line px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm">
                      {item.category ? item.category.icon : '·'}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{item.description}</p>
                      <p className="text-[10px] text-muted">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <p className={`text-xs font-semibold ${item.type === 'income' ? 'text-accent' : 'text-red-600'}`}>
                    {item.type === 'income' ? '+' : '-'}
                    {formatCurrency(item.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
