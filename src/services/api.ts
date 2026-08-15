import { Task, User, Activity, RealtimeEvent } from '../types';

const TOKEN_KEY = 'taskflow_auth_token';
const USER_KEY = 'taskflow_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) {
        errorMessage = errData.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  async register(name: string, email: string, password: string, role = 'member'): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  // Tasks
  async getTasks(params?: Record<string, string>): Promise<Task[]> {
    let url = '/api/tasks';
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') query.append(k, v);
      });
      const qs = query.toString();
      if (qs) url += `?${qs}`;
    }
    return request<Task[]>(url);
  },

  async getTask(id: string): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`);
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    return request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async deleteTask(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Subtasks
  async addSubtask(taskId: string, title: string): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async updateSubtask(taskId: string, subtaskId: string, updates: { title?: string; completed?: boolean }): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },

  // Comments
  async addComment(taskId: string, content: string): Promise<Task> {
    return request<Task>(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    return request<Activity[]>('/api/activities');
  },

  // AI Breakdown
  async generateAiBreakdown(data: { title: string; description?: string; category?: string }): Promise<{
    suggestedSubtasks: string[];
    enhancedDescription: string;
    suggestedPriority: string;
    suggestedTags: string[];
  }> {
    return request('/api/ai/breakdown', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reset/Seed
  async resetSeedData(): Promise<{ success: boolean; tasks: Task[] }> {
    return request<{ success: boolean; tasks: Task[] }>('/api/seed', {
      method: 'POST',
    });
  },

  // Real-time Event Subscription (SSE)
  subscribeToEvents(onEvent: (event: RealtimeEvent) => void, onError?: (err: any) => void): () => void {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type && data.type !== 'CONNECTED') {
          onEvent(data as RealtimeEvent);
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  },
};
