import { useToast } from '@/context/ToastContext';

const toneStyles = {
  success: 'border-accent-400/30 bg-accent-500/15 text-accent-50',
  error: 'border-red-400/30 bg-red-500/15 text-red-50',
  info: 'border-sand-300/30 bg-sand-500/15 text-sand-50',
};

export default function ToastViewport() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-xl ${toneStyles[toast.tone]}`}>
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description && <p className="mt-1 text-sm text-white/80">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}