'use client'
import React from 'react'
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from '@/components'
import { Column, Task } from '../types'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks }) => {
  return (
    <div className="w-1/3 bg-gray-100 rounded shadow p-2 h-full">
      <h2 className="text-lg font-semibold mb-2">{column.title}</h2>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[100px] rounded ${
              snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default KanbanColumn
