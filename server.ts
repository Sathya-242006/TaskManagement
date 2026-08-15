import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-secret-key-super-secure-2026';
const PORT = 3000;

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'member' | 'viewer';
  color: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  createdAt: string;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

interface ActivityRecord {
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

// Initial mock database in memory
const users: UserRecord[] = [
  {
    id: 'user-1',
    name: 'Alex Rivera',
    email: 'alex@taskflow.dev',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'admin',
    color: '#3b82f6', // blue
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya@taskflow.dev',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'member',
    color: '#10b981', // emerald
  },
  {
    id: 'user-3',
    name: 'Jordan Lee',
    email: 'jordan@taskflow.dev',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'member',
    color: '#8b5cf6', // purple
  },
  {
    id: 'user-4',
    name: 'Taylor Chen',
    email: 'taylor@taskflow.dev',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'viewer',
    color: '#f59e0b', // amber
  },
];

let tasks: TaskRecord[] = [
  {
    id: 'task-1',
    title: 'Architect JWT & Role-Based Authorization Layer',
    description: 'Implement secure token generation, verification middleware, and granular permissions for admin, member, and viewer roles.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'Backend',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    creatorId: 'user-1',
    assigneeId: 'user-1',
    tags: ['Security', 'API', 'Auth'],
    subtasks: [
      { id: 'sub-1', title: 'Define JWT sign and verify handlers', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-2', title: 'Create role authorization middleware', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-3', title: 'Write token refresh & revocation tests', completed: false, createdAt: new Date().toISOString() },
    ],
    comments: [
      {
        id: 'comm-1',
        userId: 'user-2',
        userName: 'Priya Sharma',
        userColor: '#10b981',
        content: 'JWT expiration set to 7 days for dev convenience. Looking forward to review.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    order: 0,
  },
  {
    id: 'task-2',
    title: 'Design Interactive Kanban & List View System',
    description: 'Build responsive drag-or-click workflow board, flexible list view with status quick-pickers, priority matrix, and mobile-friendly layouts.',
    status: 'done',
    priority: 'high',
    category: 'Design',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    creatorId: 'user-1',
    assigneeId: 'user-3',
    tags: ['UI/UX', 'Components', 'Tailwind'],
    subtasks: [
      { id: 'sub-4', title: 'Wireframe column layout & cards', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-5', title: 'Implement smooth transition animations with motion', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-6', title: 'Add keyboard navigation and accessibility focus', completed: true, createdAt: new Date().toISOString() },
    ],
    comments: [],
    order: 0,
  },
  {
    id: 'task-3',
    title: 'Implement Real-Time SSE Stream for Multi-User Live Sync',
    description: 'Set up Server-Sent Events channel so team members receive instant real-time updates when tasks are added, moved, or updated.',
    status: 'in_progress',
    priority: 'high',
    category: 'Realtime',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'user-2',
    assigneeId: 'user-2',
    tags: ['SSE', 'WebSockets', 'Sync'],
    subtasks: [
      { id: 'sub-7', title: 'Set up Express SSE endpoint with keep-alive', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-8', title: 'Handle client disconnect and cleanup', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-9', title: 'Broadcast task mutations to all subscribers', completed: false, createdAt: new Date().toISOString() },
    ],
    comments: [
      {
        id: 'comm-2',
        userId: 'user-1',
        userName: 'Alex Rivera',
        userColor: '#3b82f6',
        content: 'SSE works cleanly across containers without proxy buffering issues.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
    order: 1,
  },
  {
    id: 'task-4',
    title: 'Build Gemini AI Task Breakdown & Subtask Generator',
    description: 'Leverage Google GenAI SDK to automatically suggest actionable subtasks and refine descriptions when users click "AI Assist".',
    status: 'todo',
    priority: 'medium',
    category: 'AI & Automation',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'user-1',
    assigneeId: 'user-1',
    tags: ['Gemini', 'AI', 'Productivity'],
    subtasks: [
      { id: 'sub-10', title: 'Create backend /api/ai/breakdown endpoint', completed: false, createdAt: new Date().toISOString() },
      { id: 'sub-11', title: 'Add client modal with one-click checklist insertion', completed: false, createdAt: new Date().toISOString() },
    ],
    comments: [],
    order: 0,
  },
  {
    id: 'task-5',
    title: 'Comprehensive End-to-End Task Filtering & Search',
    description: 'Provide live multi-facet filtering by assignee, priority, category tag, status, and sort orders.',
    status: 'in_review',
    priority: 'medium',
    category: 'Frontend',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'user-3',
    assigneeId: 'user-3',
    tags: ['Search', 'Filter', 'State'],
    subtasks: [
      { id: 'sub-12', title: 'Search debounce handler', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-13', title: 'Multi-select category filter pills', completed: true, createdAt: new Date().toISOString() },
    ],
    comments: [],
    order: 0,
  },
  {
    id: 'task-6',
    title: 'Design Project Metrics & Workload Analytics View',
    description: 'Visualize completion ratios, priority distributions, team workload balance, and chronological audit trail.',
    status: 'todo',
    priority: 'low',
    category: 'Analytics',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'user-1',
    assigneeId: 'user-2',
    tags: ['Metrics', 'Dashboard', 'Reports'],
    subtasks: [
      { id: 'sub-14', title: 'Calculate user task distributions', completed: false, createdAt: new Date().toISOString() },
      { id: 'sub-15', title: 'Render responsive bar & progress indicators', completed: false, createdAt: new Date().toISOString() },
    ],
    comments: [],
    order: 1,
  },
];

let activities: ActivityRecord[] = [
  {
    id: 'act-1',
    userId: 'user-1',
    userName: 'Alex Rivera',
    userColor: '#3b82f6',
    action: 'created',
    taskId: 'task-1',
    taskTitle: 'Architect JWT & Role-Based Authorization Layer',
    details: 'Created initial high-priority task',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'act-2',
    userId: 'user-3',
    userName: 'Jordan Lee',
    userColor: '#8b5cf6',
    action: 'status_change',
    taskId: 'task-2',
    taskTitle: 'Design Interactive Kanban & List View System',
    details: 'Moved from In Progress to Done',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'act-3',
    userId: 'user-2',
    userName: 'Priya Sharma',
    userColor: '#10b981',
    action: 'commented',
    taskId: 'task-1',
    taskTitle: 'Architect JWT & Role-Based Authorization Layer',
    details: 'Added comment regarding token expiration',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

// SSE Client Connections for real-time live sync
const sseClients: { id: string; res: Response }[] = [];

function broadcastRealtimeEvent(event: { type: string; payload: any }) {
  const data = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

function logActivity(
  user: { id: string; name: string; color: string },
  action: ActivityRecord['action'],
  task: { id: string; title: string },
  details?: string
) {
  const activity: ActivityRecord = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    action,
    taskId: task.id,
    taskTitle: task.title,
    details,
    timestamp: new Date().toISOString(),
  };

  activities.unshift(activity);
  if (activities.length > 100) activities.pop();

  broadcastRealtimeEvent({
    type: 'ACTIVITY_CREATED',
    payload: activity,
  });
}

// Auth Middleware
function authenticateToken(req: Request & { user?: any }, res: Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      color: user.color,
    };
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired session token' });
  }
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // === API ROUTES ===

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Real-Time SSE Endpoint
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const client = { id: clientId, res };
    sseClients.push(client);

    // Initial greeting
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, timestamp: new Date().toISOString() })}\n\n`);

    // Keep alive ping
    const pingInterval = setInterval(() => {
      res.write(`: ping\n\n`);
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      const index = sseClients.findIndex((c) => c.id === clientId);
      if (index !== -1) {
        sseClients.splice(index, 1);
      }
    });
  });

  // 3. User Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 8),
      role: role === 'admin' ? 'admin' : role === 'viewer' ? 'viewer' : 'member',
      color,
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const userSafe = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      color: newUser.color,
    };

    res.status(201).json({ token, user: userSafe });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      color: user.color,
    };

    res.json({ token, user: userSafe });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.get('/api/users', authenticateToken, (req, res) => {
    const userList = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      color: u.color,
    }));
    res.json(userList);
  });

  // 4. Tasks CRUD Routes
  app.get('/api/tasks', authenticateToken, (req, res) => {
    const { status, priority, category, assigneeId, search } = req.query;

    let filtered = [...tasks];

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === String(category).toLowerCase());
    }
    if (assigneeId && assigneeId !== 'all') {
      filtered = filtered.filter((t) => t.assigneeId === assigneeId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  app.post('/api/tasks', authenticateToken, (req: any, res) => {
    const { title, description = '', status = 'todo', priority = 'medium', category = 'General', dueDate, assigneeId, tags = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask: TaskRecord = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      description: description.trim(),
      status: status || 'todo',
      priority: priority || 'medium',
      category: category.trim() || 'General',
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: req.user.id,
      assigneeId: assigneeId || req.user.id,
      tags: Array.isArray(tags) ? tags : [],
      subtasks: [],
      comments: [],
      order: tasks.filter((t) => t.status === (status || 'todo')).length,
    };

    tasks.unshift(newTask);
    logActivity(req.user, 'created', newTask, `Created task in ${newTask.status}`);
    broadcastRealtimeEvent({ type: 'TASK_CREATED', payload: newTask });

    res.status(201).json(newTask);
  });

  app.get('/api/tasks/:id', authenticateToken, (req, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });

  app.put('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Viewers cannot modify tasks
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewer role has read-only access' });
    }

    const currentTask = tasks[taskIndex];
    const { title, description, status, priority, category, dueDate, assigneeId, tags, order, subtasks } = req.body;

    const statusChanged = status && status !== currentTask.status;

    const updatedTask: TaskRecord = {
      ...currentTask,
      title: title !== undefined ? title.trim() : currentTask.title,
      description: description !== undefined ? description : currentTask.description,
      status: status !== undefined ? status : currentTask.status,
      priority: priority !== undefined ? priority : currentTask.priority,
      category: category !== undefined ? category : currentTask.category,
      dueDate: dueDate !== undefined ? dueDate : currentTask.dueDate,
      assigneeId: assigneeId !== undefined ? assigneeId : currentTask.assigneeId,
      tags: tags !== undefined ? tags : currentTask.tags,
      order: order !== undefined ? order : currentTask.order,
      subtasks: subtasks !== undefined ? subtasks : currentTask.subtasks,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;

    const action = statusChanged ? 'status_change' : 'updated';
    const detail = statusChanged ? `Changed status to ${updatedTask.status}` : 'Updated task properties';
    logActivity(req.user, action, updatedTask, detail);
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: updatedTask });

    res.json(updatedTask);
  });

  app.delete('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewer role has read-only access' });
    }

    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);

    logActivity(req.user, 'deleted', deletedTask, `Deleted task "${deletedTask.title}"`);
    broadcastRealtimeEvent({ type: 'TASK_DELETED', payload: { id: req.params.id } });

    res.json({ success: true, id: req.params.id });
  });

  // 5. Subtask Routes
  app.post('/api/tasks/:id/subtasks', authenticateToken, (req: any, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role === 'viewer') return res.status(403).json({ error: 'Read-only access' });

    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Subtask title is required' });

    const newSubtask: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    task.subtasks.push(newSubtask);
    task.updatedAt = new Date().toISOString();

    logActivity(req.user, 'updated', task, `Added subtask "${newSubtask.title}"`);
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: task });

    res.status(201).json(task);
  });

  app.put('/api/tasks/:id/subtasks/:subtaskId', authenticateToken, (req: any, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role === 'viewer') return res.status(403).json({ error: 'Read-only access' });

    const subtask = task.subtasks.find((s) => s.id === req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    const { title, completed } = req.body;
    if (title !== undefined) subtask.title = title.trim();
    if (completed !== undefined) subtask.completed = completed;
    task.updatedAt = new Date().toISOString();

    logActivity(req.user, 'subtask_toggle', task, `${subtask.completed ? 'Completed' : 'Unchecked'} subtask "${subtask.title}"`);
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: task });

    res.json(task);
  });

  app.delete('/api/tasks/:id/subtasks/:subtaskId', authenticateToken, (req: any, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role === 'viewer') return res.status(403).json({ error: 'Read-only access' });

    const subIndex = task.subtasks.findIndex((s) => s.id === req.params.subtaskId);
    if (subIndex === -1) return res.status(404).json({ error: 'Subtask not found' });

    const removed = task.subtasks.splice(subIndex, 1)[0];
    task.updatedAt = new Date().toISOString();

    logActivity(req.user, 'updated', task, `Removed subtask "${removed.title}"`);
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: task });

    res.json(task);
  });

  // 6. Comments Routes
  app.post('/api/tasks/:id/comments', authenticateToken, (req: any, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content cannot be empty' });

    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: req.user.id,
      userName: req.user.name,
      userColor: req.user.color,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    task.comments.push(newComment);
    task.updatedAt = new Date().toISOString();

    logActivity(req.user, 'commented', task, `Commented: "${content.slice(0, 30)}..."`);
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: task });

    res.status(201).json(task);
  });

  // 7. Activity Log Route
  app.get('/api/activities', authenticateToken, (req, res) => {
    res.json(activities);
  });

  // 8. AI Task Assistant (Google GenAI)
  app.post('/api/ai/breakdown', authenticateToken, async (req: any, res) => {
    const { title, description = '', category = 'General' } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `You are a project manager assistant. Given a task with Title: "${title}", Category: "${category}", Description: "${description}", provide a structured JSON response containing:
1. "suggestedSubtasks": an array of 4-6 concise actionable subtask step strings.
2. "enhancedDescription": a clear, 2-3 sentence refined summary of requirements and acceptance criteria.
3. "suggestedPriority": either "low", "medium", "high", or "urgent".
4. "suggestedTags": array of 2-4 short relevant tags.

Respond ONLY with valid JSON in this format:
{
  "suggestedSubtasks": ["step 1", "step 2", "step 3"],
  "enhancedDescription": "...",
  "suggestedPriority": "high",
  "suggestedTags": ["Tag1", "Tag2"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        }
      }

      // Fallback heuristics when GEMINI_API_KEY is not configured
      const defaultSubtasks = [
        `Research requirements and technical scope for ${title}`,
        `Draft architecture design and interface contract`,
        `Implement core functional logic and edge cases`,
        `Perform testing and code review verification`,
      ];
      return res.json({
        suggestedSubtasks: defaultSubtasks,
        enhancedDescription: `Execute and deliver "${title}" ensuring all functional requirements, unit tests, and usability guidelines are satisfied.`,
        suggestedPriority: 'high',
        suggestedTags: [category, 'Feature', 'Sprint-1'],
      });
    } catch (err: any) {
      console.error('AI breakdown error:', err);
      return res.json({
        suggestedSubtasks: [
          `Analyze scope for ${title}`,
          `Implement solution`,
          `Validate functionality & test`,
        ],
        enhancedDescription: `Task requirements and deliverables for ${title}.`,
        suggestedPriority: 'medium',
        suggestedTags: [category, 'Task'],
      });
    }
  });

  // 9. Reset / Seed Endpoint for rapid demo testing
  app.post('/api/seed', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reset the workspace data' });
    }
    // Re-seed default sample tasks
    tasks = [
      {
        id: `task-${Date.now()}-1`,
        title: 'Architect JWT & Role-Based Authorization Layer',
        description: 'Implement secure token generation, verification middleware, and granular permissions for admin, member, and viewer roles.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Backend',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        creatorId: 'user-1',
        assigneeId: 'user-1',
        tags: ['Security', 'API', 'Auth'],
        subtasks: [
          { id: 'sub-1', title: 'Define JWT sign and verify handlers', completed: true, createdAt: new Date().toISOString() },
          { id: 'sub-2', title: 'Create role authorization middleware', completed: true, createdAt: new Date().toISOString() },
          { id: 'sub-3', title: 'Write token refresh & revocation tests', completed: false, createdAt: new Date().toISOString() },
        ],
        comments: [],
        order: 0,
      },
      {
        id: `task-${Date.now()}-2`,
        title: 'Design Interactive Kanban & List View System',
        description: 'Build responsive drag-or-click workflow board, flexible list view with status quick-pickers, priority matrix, and mobile-friendly layouts.',
        status: 'done',
        priority: 'high',
        category: 'Design',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
        creatorId: 'user-1',
        assigneeId: 'user-3',
        tags: ['UI/UX', 'Components', 'Tailwind'],
        subtasks: [
          { id: 'sub-4', title: 'Wireframe column layout & cards', completed: true, createdAt: new Date().toISOString() },
          { id: 'sub-5', title: 'Implement smooth transition animations with motion', completed: true, createdAt: new Date().toISOString() },
        ],
        comments: [],
        order: 0,
      },
      {
        id: `task-${Date.now()}-3`,
        title: 'Implement Real-Time SSE Stream for Multi-User Live Sync',
        description: 'Set up Server-Sent Events channel so team members receive instant real-time updates when tasks are added, moved, or updated.',
        status: 'in_progress',
        priority: 'high',
        category: 'Realtime',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        creatorId: 'user-2',
        assigneeId: 'user-2',
        tags: ['SSE', 'WebSockets', 'Sync'],
        subtasks: [
          { id: 'sub-7', title: 'Set up Express SSE endpoint with keep-alive', completed: true, createdAt: new Date().toISOString() },
          { id: 'sub-8', title: 'Handle client disconnect and cleanup', completed: true, createdAt: new Date().toISOString() },
        ],
        comments: [],
        order: 1,
      },
    ];

    logActivity(req.user, 'created', { id: 'all', title: 'Workspace Reset' }, 'Reset sample tasks to default demo state');
    broadcastRealtimeEvent({ type: 'TASK_UPDATED', payload: { reset: true } });
    res.json({ success: true, tasks });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
