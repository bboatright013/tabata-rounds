// src/components/taskForm/index.tsx
'use client'

import React, { useState } from 'react'

interface TaskFormProps {
  onSave: (title: string, details: string) => void
  onCancel: () => void
}

export default function TaskForm({ onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    onSave(title.trim(), details.trim())
    setTitle('')
    setDetails('')
  }

  return (
    <div className="w-full p-4 bg-gray-800 text-white flex flex-col space-y-3">
      <h2 className="text-xl font-semibold">New Task</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 rounded text-black"
      />
      <textarea
        placeholder="Details"
        value={details}
        onChange={e => setDetails(e.target.value)}
        className="w-full p-2 rounded text-black h-24"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  )
}
