import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <p className="text-sm font-semibold text-[#F97316]">404</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#0F2940]">
              Page not found
            </h1>
            <p className="mt-3 text-[#475569]">
              The page you’re looking for doesn’t exist or was moved.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-black text-white hover:bg-[#29292a] transition-colors"
              >
                Go to Home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-11 px-5 rounded-md border border-[#E2E8F0] bg-white text-[#0F2940] hover:bg-[#F8FAFC] transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2 flex items-center justify-center">
            <Image
              src="/feeling.png"
              alt="Not found"
              width={520}
              height={360}
              priority
              className="w-full max-w-[520px] h-auto"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
