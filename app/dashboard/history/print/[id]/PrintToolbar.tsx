'use client';

export function PrintToolbar() {
  return (
    <div className="no-print px-6 py-4 border-b border-slate-200 flex items-center justify-between">
      <div className="text-sm text-slate-600">Print Preview</div>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-[#F97316] px-4 py-2 text-sm font-semibold text-white"
      >
        Print
      </button>
    </div>
  );
}
