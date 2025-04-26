'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Tabata Rounds
        </Link>
        <nav className="space-x-4">
          {/* Add additional navigation links as needed */}
        </nav>
      </div>
    </header>
  );
}
