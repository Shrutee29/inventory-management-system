export default function StatCard({ label, value, caption, accent = false }) {
  return (
    <div className={`rounded-3xl border p-5 ${accent ? 'border-accent-400/30 bg-accent-500/10' : 'border-white/10 bg-white/5'}`}>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {caption && <p className="mt-2 text-sm text-slate-300">{caption}</p>}
    </div>
  );
}