import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ open, title, onClose, children, wide = false }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`card anim-modal relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto shadow-lift`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted transition duration-150 hover:bg-sage hover:text-ink">
            <FiX size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
