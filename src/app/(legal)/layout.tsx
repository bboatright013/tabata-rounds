// src/app/(legal)/layout.tsx
import React from 'react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow mb-8">
        <div className="max-w-3xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
