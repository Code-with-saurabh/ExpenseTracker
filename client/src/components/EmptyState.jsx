const EmptyState = ({ title, message, actionLabel, onAction, icon = null }) => {
  return (
    <div className="anim-fade flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-sage text-lg text-muted">
        {icon || '·'}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted">{message}</p>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="btn-primary btn-sm mt-1">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
