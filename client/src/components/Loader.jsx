const Loader = ({ label = 'Loading' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
};

export const SkeletonRow = () => {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-3 flex-1" />
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-3 w-16" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-3 h-6 w-32" />
      <div className="skeleton mt-3 h-3 w-20" />
    </div>
  );
};

export const SkeletonGrid = ({ count = 4 }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default Loader;
