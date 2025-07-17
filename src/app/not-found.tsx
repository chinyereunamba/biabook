import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="rounded-xl bg-white/80 p-8 text-center shadow-lg">
        <div className="mb-4 text-6xl">😕</div>
        <h1 className="mb-2 text-2xl font-bold text-blue-900">
          Page Not Found
        </h1>
        <p className="mb-6 text-blue-800">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/">
          <span className="inline-block cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600">
            Go Home
          </span>
        </Link>
      </div>
    </main>
  );
}
