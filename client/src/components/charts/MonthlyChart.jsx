import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['#78816A', '#C2703D', '#493B32', '#B08968', '#8A9A5B', '#6E7B8B', '#A97C64', '#5F6B5A', '#C08552', '#9A8C7A', '#8B6F5C', '#7D8F69'];

const tooltipStyle = {
  backgroundColor: '#29231F',
  color: '#FAF8F3',
  border: 'none',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: '"JetBrains Mono", monospace',
};

const MonthlyChart = ({ type, data, currencySymbol }) => {
  if (type === 'donut' || type === 'pie') {
    const pieData = data
      .filter((item) => item.expense > 0)
      .map((item) => ({ name: `${item.name} ${item.year || ''}`.trim(), value: item.expense }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={type === 'donut' ? 60 : 0}
            outerRadius={95}
            paddingAngle={1}
            animationDuration={250}
          >
            {pieData.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`} />
          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const common = (
    <>
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#78816A' }} axisLine={false} tickLine={false} width={65} />
      <Tooltip
        contentStyle={tooltipStyle}
        formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
      />
      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }} />
    </>
  );

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {common}
          <Line type="monotone" dataKey="income" name="Income" stroke="#78816A" strokeWidth={2} animationDuration={250} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="expense" name="Expense" stroke="#C2703D" strokeWidth={2} animationDuration={250} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {common}
          <Area type="monotone" dataKey="income" name="Income" stroke="#78816A" fill="#78816A" fillOpacity={0.25} animationDuration={250} />
          <Area type="monotone" dataKey="expense" name="Expense" stroke="#C2703D" fill="#C2703D" fillOpacity={0.25} animationDuration={250} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
        {common}
        <Bar dataKey="income" name="Income" fill="#78816A" radius={[5, 5, 0, 0]} animationDuration={250} />
        <Bar dataKey="expense" name="Expense" fill="#C2703D" radius={[5, 5, 0, 0]} animationDuration={250} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
