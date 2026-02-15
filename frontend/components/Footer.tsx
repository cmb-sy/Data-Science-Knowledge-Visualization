export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Data Science Knowledge Visualization
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Next.js</span>
            <span className="text-slate-300">|</span>
            <span>FastAPI</span>
            <span className="text-slate-300">|</span>
            <span>Recharts</span>
            <span className="text-slate-300">|</span>
            <span>KaTeX</span>
            <span className="text-slate-300">|</span>
            <span>PyTorch</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
