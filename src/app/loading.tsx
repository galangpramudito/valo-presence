export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-[12px] font-black tracking-[0.2em] uppercase text-black dark:text-white">
          Loading...
        </p>
      </div>
    </div>
  );
}
