// types.ts
export type TaskType      = 'feature' | 'bug' | 'improvement' | 'research' | string
export type TaskStatus    = 'backlog' | 'active' | 'review' | 'completed' | 'archived'
export type TaskPriority  = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  details: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  dueDate?: string
  // you can add more: created_on, updated_on, watchers, etc.
}

export interface Column {
  id: string
  title: string
  taskIds: string[]    // stays the same
}

export interface BoardData {
  tasks: { [key: string]: Task }
  columns: { [key: string]: Column }
  columnOrder: string[]
}

// Analytics summary for a Project
export interface ProjectAnalytics {
  totalTasks: number             // total number of tasks in the project
  tasksCompleted: number         // how many have been completed
  averageTaskTurnover: number    // average time from start→completion (e.g. in ms)
  completionRate: number         // tasksCompleted / totalTasks
}

// A Project: a collection of tasks, members, dates, and analytics
export interface Project {
  id: string
  title: string
  description?: string

  createdOn: string      // ISO date
  createdBy: string      // user_id

  members: string[]      // user_id[]
  taskIds: string[]      // task_id[]

  status: 'active' | 'paused' | 'completed' | 'archived'

  startDate?: string     // ISO date
  endDate?: string       // ISO date

  tags?: string[]

  analytics?: ProjectAnalytics
}

// A single step in a Workflow’s template
export interface WorkflowStep {
  id: string
  name: string
  description?: string
  sequence: number       // order in which steps run
}

// Live instance of a Workflow in progress
export interface WorkflowInstance {
  id: string

  startedOn: string      // ISO date
  startedBy: string      // user_id

  currentStep: WorkflowStep
  taskIds: string[]      // which tasks belong to this run
  completedSteps: WorkflowStep[]

  completedOn?: string   // ISO date
}

// Analytics summary for a Workflow
export interface WorkflowAnalytics {
  totalInstancesStarted: number
  averageCompletionTime: number  // e.g. in ms
  activeInstances: number
  completedInstances: number
}

// A Workflow: the template + active/running instances + analytics
export interface Workflow {
  id: string
  name: string
  description?: string

  createdOn: string      // ISO date
  createdBy: string      // user_id

  members: string[]      // user_id[]
  taskIds: string[]      // task_id[]

  steps: WorkflowStep[]

  activeInstances?: WorkflowInstance[]
  analytics?: WorkflowAnalytics
}
