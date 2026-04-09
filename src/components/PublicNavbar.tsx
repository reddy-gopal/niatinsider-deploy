"use client";

import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-navbar border-b border-[rgba(30,41,59,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <img
                src="/niat.svg"
                alt="NIAT"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#991b1b]">NIAT</span>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-black">Insider</span>
            </Link>

            <div className="flex items-center flex-wrap justify-end gap-2 lg:gap-4 shrink-0">
              <Link href="/articles" className="text-black hover:text-black text-sm font-medium transition-colors">
                Articles
              </Link>
              <Link href="/login" className="text-black hover:text-black text-sm font-medium transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
