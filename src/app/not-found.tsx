export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#090c10] text-[#c0cdd8] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-tnc-text3">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-white tracking-[-0.4px]">Page Not Found</h1>
        <p className="mt-2 text-sm text-tnc-text2">The page you requested does not exist.</p>
      </div>
    </main>
  );
}
