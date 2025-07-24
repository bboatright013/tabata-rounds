// types.ts
export type TaskType      = 'feature' | 'bug' | 'improvement' | 'research' | string;
export type TaskStatus    = 'backlog' | 'active' | 'review' | 'completed' | 'archived';
export type TaskPriority  = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  details: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  // you can add more: created_on, updated_on, watchers, etc.
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];    // stays the same
}

export interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}
