export default function AuthHero({ eyebrow, title, description }) {
  return (
    <div className="space-y-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-soft">
      <p className="text-xs uppercase tracking-[0.4em] text-sand-200">{eyebrow}</p>
      <h1 className="title-font max-w-lg text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
      <p className="max-w-xl text-base leading-7 text-slate-300">{description}</p>
    </div>
  );
}