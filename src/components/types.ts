export interface Task {
  id: string
  title: string
  details: string
  timestamps: string[]
}

export interface Column {
  id: string
  title: string
  taskIds: string[]
}

export interface BoardData {
  tasks: { [key: string]: Task }
  columns: { [key: string]: Column }
  columnOrder: string[]
}