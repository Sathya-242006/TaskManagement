import React from 'react';
import {
  Clock,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const { users, openEditTaskModal, moveTaskStatus, deleteTask } = useTasks();
  const { user: currentUser } = useAuth();

  const assignee = users.find((u) => u.id === task.assigneeId);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Due date status
  const dueDateObj = new Date(task.dueDate);
  dueDateObj.setHours(23, 59, 59, 999);
  const now = new Date();
  const isOverdue = task.status !== 'done' && dueDateObj.getTime() < now.getTime();
  const isDueToday =
    task.status !== 'done' &&
    new Date(task.dueDate).toDateString() === now.toDateString();

  const priorityStyles: Record<TaskPriority, { badge: string }> = {
    urgent: { badge: 'border border-red-500 text-red-400 bg-[#2b0c0c]' },
    high: { badge: 'border border-amber-500 text-amber-400 bg-[#2b1e0c]' },
    medium: { badge: 'border border-[#3B82F6] text-[#3B82F6] bg-[#0c1a30]' },
    low: { badge: 'border border-[#333] text-[#888] bg-[#161616]' },
  };

  const statusWorkflow: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
  const currentIndex = statusWorkflow.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? statusWorkflow[currentIndex - 1] : null;
  const nextStatus = currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => openEditTaskModal(task)}
      className="group relative bg-[#121212] border border-[#222] hover:border-[#3B82F6] transition-all duration-150 p-4 cursor-pointer flex flex-col gap-2.5 shadow-sm"
    >
      {/* Top row: Category & Priority */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] truncate">
          {task.category || 'GENERAL'}
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
            priorityStyles[task.priority].badge
          }`}
        >
          {task.priority === 'urgent' && <AlertTriangle className="w-2.5 h-2.5 mr-1 text-red-400" />}
          {task.priority}
        </span>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug tracking-tight group-hover:text-[#3B82F6] transition-colors">
        {task.title}
      </h3>

      {/* Task Description Preview */}
      {!compact && task.description && (
        <p className="text-xs text-[#777] line-clamp-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar if any */}
      {totalSubtasks > 0 && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#666]">
            <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
              <CheckSquare className="w-3 h-3 text-[#3B82F6]" />
              <span>
                {completedSubtasks}/{totalSubtasks} STEPS
              </span>
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1 bg-[#222] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {task.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#181818] border border-[#282828] text-[#888]"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#181818] border border-[#282828] text-[#666]">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: Due Date, Comments, Assignee */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#1e1e1e] text-xs">
        {/* Due Date Indicator */}
        <div
          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
            isOverdue
              ? 'text-red-400 font-black'
              : isDueToday
              ? 'text-amber-400 font-black'
              : 'text-[#666]'
          }`}
          title={`Due date: ${task.dueDate}`}
        >
          <Calendar className="w-3 h-3" />
          <span>
            {isOverdue
              ? 'OVERDUE'
              : isDueToday
              ? 'TODAY'
              : new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#666]">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}

          {/* Assignee Avatar */}
          {assignee ? (
            <div
              className="w-5 h-5 flex items-center justify-center text-white text-[9px] font-black uppercase"
              style={{ backgroundColor: assignee.color }}
              title={`Assigned to ${assignee.name}`}
            >
              {assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div
              className="w-5 h-5 border border-dashed border-[#333] flex items-center justify-center text-[#555] text-[9px] font-mono"
              title="Unassigned"
            >
              ?
            </div>
          )}
        </div>
      </div>

      {/* Quick Move & Action Hover Controls */}
      {currentUser?.role !== 'viewer' && (
        <div
          className="flex items-center justify-between pt-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1 border-t border-[#1a1a1a]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            {prevStatus && (
              <button
                onClick={() => moveTaskStatus(task.id, prevStatus)}
                title={`Move to ${prevStatus.replace('_', ' ')}`}
                className="p-1 bg-[#1a1a1a] hover:bg-[#262626] text-[#888] hover:text-white border border-[#2a2a2a] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {nextStatus && (
              <button
                onClick={() => moveTaskStatus(task.id, nextStatus)}
                title={`Move to ${nextStatus.replace('_', ' ')}`}
                className="p-1 bg-[#1a1a1a] hover:bg-[#3B82F6] hover:text-black text-[#3B82F6] border border-[#3B82F6]/40 transition-colors font-black flex items-center gap-0.5 text-[9px] uppercase tracking-wider"
              >
                <span>MOVE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditTaskModal(task)}
              title="Edit Task"
              className="p-1 bg-[#1a1a1a] hover:bg-[#262626] text-[#888] hover:text-white border border-[#2a2a2a] transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  deleteTask(task.id);
                }
              }}
              title="Delete Task"
              className="p-1 bg-[#1a1a1a] hover:bg-[#2c0c0c] text-[#888] hover:text-red-400 border border-[#2a2a2a] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
