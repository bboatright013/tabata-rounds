import React, { useState, ChangeEvent } from 'react'
import { Task } from '../types'
export type TaskType = 'feature' | 'bug' | 'improvement' | 'research' | string
export type TaskStatus = 'backlog' | 'active' | 'review' | 'completed' | 'archived'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFormProps {
  onSave: (task: Omit<Task,'id'>) => void
  onCancel: () => void
}

export default function TaskForm({ onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [type, setType] = useState<TaskType>('feature')
  const [status, setStatus] = useState<TaskStatus>('backlog')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<string>('')

  const handleTagAdd = () => {
    const newTag = tagsInput.trim()
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag])
      setTagsInput('')
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      details: details.trim(),
      type,
      status,
      priority,
      tags,
      dueDate: dueDate || undefined,
    })
    // reset form
    setTitle('')
    setDetails('')
    setType('feature')
    setStatus('backlog')
    setPriority('medium')
    setTags([])
    setDueDate('')
  }

  return (
    <div className="w-full h-full p-6 bg-gray-900 text-white overflow-auto">
      <h2 className="text-2xl font-bold mb-4">New Task</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 text-sm font-medium">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="status" className="mb-1 text-sm font-medium">Status</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="backlog">Backlog</option>
            <option value="active">Active</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 text-sm font-medium">Type</label>
          <select
            id="type"
            value={type}
            onChange={e => setType(e.target.value as TaskType)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="improvement">Improvement</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="priority" className="mb-1 text-sm font-medium">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <label htmlFor="details" className="mb-1 text-sm font-medium">Details</label>
          <textarea
            id="details"
            placeholder="Task description"
            value={details}
            onChange={e => setDetails(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="dueDate" className="mb-1 text-sm font-medium">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <label className="mb-1 text-sm font-medium">Tags</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Add tag"
              value={tagsInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTagsInput(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-700 rounded-full text-sm">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-500 rounded hover:bg-green-600"
        >
          Save Task
        </button>
      </div>
    </div>
  )
}
