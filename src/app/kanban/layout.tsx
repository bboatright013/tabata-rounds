// src/app/kanban/layout.tsx
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kanban Board | Tabata Rounds',
  description: 'Organize your tasks with the Kanban board',
}

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen">
      <div className="max-w-6xl mx-auto py-8">
        {children}
      </div>
    </section>
  )
}