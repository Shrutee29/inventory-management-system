export default function FormField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-accent-400/50 focus:bg-white/[0.08]"
      />
      {error && <span className="mt-2 block text-sm text-red-300">{error}</span>}
    </label>
  );
}