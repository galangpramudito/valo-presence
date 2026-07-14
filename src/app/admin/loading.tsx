export default function AdminLoading() {
  return (
    <div className="flex-1 py-12 px-4 bg-white dark:bg-black min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="h-10 w-64 bg-black/10 dark:bg-white/10 animate-pulse mb-6"></div>
          <div className="flex gap-4 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="h-10 w-32 bg-black/10 dark:bg-white/10 animate-pulse"></div>
            <div className="h-10 w-32 bg-black/10 dark:bg-white/10 animate-pulse"></div>
            <div className="h-10 w-32 bg-black/10 dark:bg-white/10 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="border border-black/10 dark:border-white/10 p-6">
              <div className="h-6 w-40 bg-black/10 dark:bg-white/10 animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-16 bg-black/5 dark:bg-white/5 animate-pulse"></div>
                <div className="h-16 bg-black/5 dark:bg-white/5 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="h-20 bg-black/5 dark:bg-white/5 animate-pulse"></div>
            <div className="h-20 bg-black/5 dark:bg-white/5 animate-pulse"></div>
            <div className="h-20 bg-black/5 dark:bg-white/5 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
