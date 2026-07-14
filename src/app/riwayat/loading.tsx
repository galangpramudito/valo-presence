export default function RiwayatLoading() {
  return (
    <main className="flex-1 py-12 px-4 bg-white dark:bg-black min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-black/10 dark:bg-white/10 animate-pulse mb-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-black/10 dark:border-white/10 p-4 bg-black/5 dark:bg-white/5 animate-pulse">
              <div className="aspect-video bg-black/10 dark:bg-white/10 mb-3"></div>
              <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 mb-2"></div>
              <div className="h-3 w-1/2 bg-black/10 dark:bg-white/10"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
