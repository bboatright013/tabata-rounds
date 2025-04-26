'use client'
import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Task } from '../types'

interface TaskCardProps {
  task: Task
  index: number
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-4 rounded shadow cursor-pointer select-none ${
            snapshot.isDragging ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
          }`}
          style={provided.draggableProps.style}
        >
          <h3 className="font-bold">{task.title}</h3>
          <p className="text-sm">{task.details}</p>
        </div>
      )}
    </Draggable>
  )
}

export default TaskCard
