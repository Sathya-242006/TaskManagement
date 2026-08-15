import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, User, Activity, FilterOptions, TaskStatus, TaskPriority, RealtimeEvent } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export type ViewMode = 'kanban' | 'list' | 'calendar' | 'matrix' | 'analytics';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  users: User[];
  activities: Activity[];
  isLoading: boolean;
  isSyncing: boolean;
  isRealtimeConnected: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  categories: string[];

  // Modals & Selected
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  modalDefaultStatus: TaskStatus;
  openCreateTaskModal: (status?: TaskStatus) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  isAiModalOpen: boolean;
  openAiModal: (initialTask?: Partial<Task>) => void;
  closeAiModal: () => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Actions
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultFilters: FilterOptions = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  assigneeId: 'all',
  sortBy: 'order',
  sortOrder: 'asc',
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');

  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load initial data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsSyncing(true);
      const [tasksData, usersData, activitiesData] = await Promise.all([
        api.getTasks(),
        api.getUsers(),
        api.getActivities(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to fetch task data:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Event Subscription via SSE
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = api.subscribeToEvents(
      (event: RealtimeEvent) => {
        setIsRealtimeConnected(true);

        if (event.type === 'TASK_CREATED') {
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === event.payload.id);
            if (exists) return prev;
            return [event.payload, ...prev];
          });
        } else if (event.type === 'TASK_UPDATED') {
          if (event.payload?.reset) {
            fetchData();
            return;
          }
          setTasks((prev) =>
            prev.map((t) => (t.id === event.payload.id ? event.payload : t))
          );
          setSelectedTask((curr) => (curr && curr.id === event.payload.id ? event.payload : curr));
        } else if (event.type === 'TASK_DELETED') {
          setTasks((prev) => prev.filter((t) => t.id !== event.payload.id));
          setSelectedTask((curr) => (curr && curr.id === event.payload.id ? null : curr));
        } else if (event.type === 'ACTIVITY_CREATED') {
          setActivities((prev) => [event.payload, ...prev.slice(0, 49)]);
        }
      },
      () => {
        setIsRealtimeConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, fetchData]);

  // Derive available categories
  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  ).sort();

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchCategory) return false;
    }

    // Status
    if (filters.status !== 'all' && task.status !== filters.status) return false;

    // Priority
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

    // Category
    if (filters.category !== 'all' && task.category.toLowerCase() !== filters.category.toLowerCase()) return false;

    // Assignee
    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned') {
        if (task.assigneeId) return false;
      } else {
        if (task.assigneeId !== filters.assigneeId) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
    if (filters.sortBy === 'dueDate') {
      return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * multiplier;
    }
    if (filters.sortBy === 'priority') {
      const pWeights: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pWeights[a.priority] - pWeights[b.priority]) * multiplier;
    }
    if (filters.sortBy === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
    }
    if (filters.sortBy === 'title') {
      return a.title.localeCompare(b.title) * multiplier;
    }
    return (a.order - b.order) * multiplier;
  });

  const resetFilters = () => setFilters(defaultFilters);

  // Modal actions
  const openCreateTaskModal = (status: TaskStatus = 'todo') => {
    setSelectedTask(null);
    setModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const openAiModal = () => {
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
  };

  // CRUD Actions
  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const newTask = await api.createTask(taskData);
    setTasks((prev) => [newTask, ...prev]);
    closeTaskModal();
    return newTask;
  };

  const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const updated = await api.updateTask(id, taskData);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(updated);
    }
    return updated;
  };

  const deleteTask = async (id: string): Promise<void> => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask && selectedTask.id === id) {
      closeTaskModal();
    }
  };

  const moveTaskStatus = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === newStatus) return;

    if (newStatus === 'done') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );

    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? current : t))
      );
      throw err;
    }
  };

  const addSubtask = async (taskId: string, title: string): Promise<void> => {
    const updated = await api.addSubtask(taskId, title);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string, completed: boolean): Promise<void> => {
    const updated = await api.updateSubtask(taskId, subtaskId, { completed });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const updated = await api.deleteSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const addComment = async (taskId: string, content: string): Promise<void> => {
    const updated = await api.addComment(taskId, content);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
  };

  const resetToDemoData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.resetSeedData();
      setTasks(res.tasks);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        users,
        activities,
        isLoading,
        isSyncing,
        isRealtimeConnected,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        resetFilters,
        categories,
        selectedTask,
        isTaskModalOpen,
        modalDefaultStatus,
        openCreateTaskModal,
        openEditTaskModal,
        closeTaskModal,
        isAiModalOpen,
        openAiModal,
        closeAiModal,
        isAuthModalOpen,
        setIsAuthModalOpen,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addComment,
        resetToDemoData,
        refreshData: fetchData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
