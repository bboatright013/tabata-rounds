// app/kanban/page.tsx
import KanbanBoard from '@/components/kanban/KanbanBoard'

export const metadata = {
  title: 'Kanban Board',
}

export default function KanbanPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">My Kanban</h1>
      <KanbanBoard />
    </div>
  )
}
