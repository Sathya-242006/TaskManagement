export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatarUrl?: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assigneeId?: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  order: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  action: 'created' | 'updated' | 'deleted' | 'status_change' | 'commented' | 'subtask_toggle';
  taskId: string;
  taskTitle: string;
  details?: string;
  timestamp: string;
}

export interface FilterOptions {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string | 'all';
  assigneeId: string | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'order';
  sortOrder: 'asc' | 'desc';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RealtimeEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'ACTIVITY_CREATED';
  payload: any;
  timestamp: string;
}
