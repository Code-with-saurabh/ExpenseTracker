const ProgressBar = ({ percentage }) => {
  const value = Math.min(100, Math.max(0, percentage));
  let barColor = 'bg-accent';
  if (value >= 100) barColor = 'bg-red-500';
  else if (value >= 80) barColor = 'bg-amber-500';

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sage">
      <div
        className={`h-full rounded-full ${barColor} transition-all duration-300`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
