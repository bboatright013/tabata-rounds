'use client'
import React, { useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from '@/components'
import { BoardData, Column } from '../types'

const initialData: BoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Sample Task', details: 'Some details here', timestamps: [] },
    // More tasks can be added here…
  },
  columns: {
    backlog: {
      id: 'backlog',
      title: 'Backlog',
      taskIds: ['task-1'],
    },
    active: {
      id: 'active',
      title: 'Active',
      taskIds: [],
    },
    review: {
      id: 'review',
      title: 'Review',
      taskIds: [],
    },
  },
  columnOrder: ['backlog', 'active', 'review'],
}

const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<BoardData>(initialData)

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const startColumn = data.columns[source.droppableId]
    const endColumn = data.columns[destination.droppableId]

    // Moving within the same column
    if (startColumn === endColumn) {
      const newTaskIds = Array.from(startColumn.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn: Column = {
        ...startColumn,
        taskIds: newTaskIds,
      }

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      })
      return
    }

    // Moving between different columns
    const startTaskIds = Array.from(startColumn.taskIds)
    startTaskIds.splice(source.index, 1);
    const newStart: Column = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const endTaskIds = Array.from(endColumn.taskIds)
    endTaskIds.splice(destination.index, 0, draggableId)
    const newEnd: Column = {
      ...endColumn,
      taskIds: endTaskIds,
    }

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newEnd.id]: newEnd,
      },
    })
  }

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kanban Dashboard</h1>
        {/* Create Task button can open a modal or inline form */}
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          onClick={() => alert('Open create task modal')}
        >
          Create Task
        </button>
      </header>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
            return (
              <KanbanColumn key={column.id} column={column} tasks={tasks} />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard
