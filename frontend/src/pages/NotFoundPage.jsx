import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <div className="glass-panel max-w-xl rounded-[2rem] p-10 text-center">
        <p className="title-font text-4xl font-bold text-white">Page not found</p>
        <p className="mt-3 text-slate-300">The route you requested does not exist in this inventory workspace.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-accent-500 px-5 py-3 font-semibold text-white transition hover:bg-accent-400">
          Return home
        </Link>
      </div>
    </div>
  );
}