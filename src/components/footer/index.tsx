'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start">
        {/* Left Column: Big Site Title */}
        <div className="mb-8 md:mb-0">
          <h1 className="text-5xl font-bold">Tabata <br /> Rounds</h1>
        </div>
        {/* Right Column: Legal Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 underline">Legal</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/cookie-policy" className="hover:text-gray-300">
                Cookie Policy
              </Link>
            </li>
            {/* Add additional legal links here */}
          </ul>
        </div>
      </div>
      {/* Copyright Notice */}
      <div className="mt-10">
        <p className="text-center text-sm pt-6">
          © {new Date().getFullYear()} Tabata Rounds. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
