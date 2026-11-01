export function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 rounded-2xl"></div>
          <div className="text-center sm:text-left space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
          </div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((section) => (
            <div
              key={section}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 bg-slate-50">
                <div className="h-5 bg-slate-200 rounded w-40"></div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((field) => (
                    <div key={field} className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                      <div className="h-11 bg-slate-200 rounded-2xl"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
