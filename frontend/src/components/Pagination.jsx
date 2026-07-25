export default function Pagination({ page, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visiblePages = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let current = startPage; current <= endPage; current += 1) {
    visiblePages.push(current);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
      <p>
        Page {page} of {totalPages} · {totalCount} results
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/[0.08]"
        >
          Previous
        </button>
        {visiblePages.map((current) => (
          <button
            key={current}
            type="button"
            onClick={() => onPageChange(current)}
            className={`rounded-full px-3 py-2 font-semibold transition ${
              current === page
                ? 'bg-accent-500 text-white'
                : 'border border-white/10 text-slate-200 hover:bg-white/[0.08]'
            }`}
          >
            {current}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/[0.08]"
        >
          Next
        </button>
      </div>
    </div>
  );
}