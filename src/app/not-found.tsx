import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] text-zinc-200">
      <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-sm text-zinc-400 mb-4">Could not find requested resource</p>
      <Link href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">
        Return Home
      </Link>
    </div>
  );
}
