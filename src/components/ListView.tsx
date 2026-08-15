import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Trash2,
  Edit2,
  CheckSquare,
  MessageSquare,
  ChevronDown,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export const ListView: React.FC = () => {
  const {
    filteredTasks,
    users,
    openEditTaskModal,
    moveTaskStatus,
    updateTask,
    deleteTask,
    openCreateTaskModal,
  } = useTasks();
  const { user: currentUser } = useAuth();

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    for (const id of selectedTaskIds) {
      await moveTaskStatus(id, newStatus);
    }
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTaskIds.length} selected tasks?`)) {
      for (const id of selectedTaskIds) {
        await deleteTask(id);
      }
      setSelectedTaskIds([]);
    }
  };

  const priorityStyles: Record<TaskPriority, { badge: string }> = {
    urgent: { badge: 'border border-red-500 text-red-400 bg-[#2b0c0c]' },
    high: { badge: 'border border-amber-500 text-amber-400 bg-[#2b1e0c]' },
    medium: { badge: 'border border-[#3B82F6] text-[#3B82F6] bg-[#0c1a30]' },
    low: { badge: 'border border-[#333] text-[#888] bg-[#161616]' },
  };

  const statusStyles: Record<TaskStatus, { badge: string; label: string }> = {
    todo: { badge: 'border border-[#444] text-[#aaa] bg-[#1a1a1a]', label: 'TO DO' },
    in_progress: { badge: 'border border-[#1e3a8a] text-[#60a5fa] bg-[#0c1e3d]', label: 'IN PROGRESS' },
    in_review: { badge: 'border border-purple-900 text-purple-300 bg-[#200c30]', label: 'IN REVIEW' },
    done: { badge: 'border border-[#065f46] text-emerald-400 bg-[#06261d]', label: 'DONE' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Bulk Action Bar if items selected */}
      {selectedTaskIds.length > 0 && currentUser?.role !== 'viewer' && (
        <div className="mb-4 p-3 bg-[#0c1e3d] border border-[#1e3a8a] flex items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
            <span className="text-[#3B82F6] font-mono font-bold">{selectedTaskIds.length}</span>
            <span>TASKS SELECTED</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] hidden sm:inline">Mark as:</span>
            <button
              onClick={() => handleBulkStatusChange('todo')}
              className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#141414] text-[#ccc] hover:text-white border border-[#333] transition-colors"
            >
              To Do
            </button>
            <button
              onClick={() => handleBulkStatusChange('in_progress')}
              className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#141414] text-[#3B82F6] hover:text-white border border-[#1e3a8a] transition-colors"
            >
              In Progress
            </button>
            <button
              onClick={() => handleBulkStatusChange('done')}
              className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#141414] text-emerald-400 hover:text-white border border-emerald-900 transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-white hover:text-black transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-[#0e0e0e] border border-[#222] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border border-[#333] flex items-center justify-center mx-auto text-[#666] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">No tasks match your criteria</h3>
            <p className="text-xs text-[#666] mt-1 max-w-sm mx-auto font-medium">
              Try adjusting your search query, status filters, or create a new task to get started.
            </p>
            {currentUser?.role !== 'viewer' && (
              <button
                onClick={() => openCreateTaskModal('todo')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors"
              >
                + CREATE NEW TASK
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141414] border-b border-[#222] text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length
                      }
                      onChange={toggleSelectAll}
                      className="cursor-pointer accent-[#3B82F6]"
                    />
                  </th>
                  <th className="py-3 px-4 min-w-[280px]">TASK DETAILS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">ASSIGNEE</th>
                  <th className="py-3 px-4">SUBTASKS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const isDone = task.status === 'done';
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                  const totalSubtasks = task.subtasks.length;

                  const dueDateObj = new Date(task.dueDate);
                  dueDateObj.setHours(23, 59, 59, 999);
                  const isOverdue = !isDone && dueDateObj.getTime() < Date.now();

                  return (
                    <tr
                      key={task.id}
                      id={`list-row-${task.id}`}
                      onClick={() => openEditTaskModal(task)}
                      className={`group hover:bg-[#141414] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#0f1d33]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4" onClick={(e) => toggleSelectTask(task.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="cursor-pointer accent-[#3B82F6]"
                        />
                      </td>

                      {/* Title & Category & Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentUser?.role !== 'viewer') {
                                moveTaskStatus(task.id, isDone ? 'todo' : 'done');
                              }
                            }}
                            title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                            className="mt-0.5 text-[#555] hover:text-emerald-400 transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#444] hover:text-[#3B82F6]" />
                            )}
                          </button>

                          <div className="space-y-0.5">
                            <span
                              className={`font-bold text-white group-hover:text-[#3B82F6] transition-colors block tracking-tight ${
                                isDone ? 'line-through text-[#666]' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-black tracking-wider text-[#666]">
                                {task.category || 'GENERAL'}
                              </span>
                              {task.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-mono text-[#888] bg-[#181818] border border-[#262626] px-1.5 py-0.2 uppercase"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {task.comments.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-[#666] font-mono">
                                  <MessageSquare className="w-3 h-3" />
                                  {task.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          disabled={currentUser?.role === 'viewer'}
                          onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wider cursor-pointer focus:outline-none ${
                            statusStyles[task.status].badge
                          }`}
                        >
                          <option value="todo" className="bg-[#111] text-white">TO DO</option>
                          <option value="in_progress" className="bg-[#111] text-white">IN PROGRESS</option>
                          <option value="in_review" className="bg-[#111] text-white">IN REVIEW</option>
                          <option value="done" className="bg-[#111] text-white">DONE</option>
                        </select>
                      </td>

                      {/* Priority Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.priority}
                          disabled={currentUser?.role === 'viewer'}
                          onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                          className={`text-[10px] px-2 py-0.5 font-black uppercase tracking-wider cursor-pointer focus:outline-none ${
                            priorityStyles[task.priority].badge
                          }`}
                        >
                          <option value="urgent" className="bg-[#111] text-white">URGENT</option>
                          <option value="high" className="bg-[#111] text-white">HIGH</option>
                          <option value="medium" className="bg-[#111] text-white">MEDIUM</option>
                          <option value="low" className="bg-[#111] text-white">LOW</option>
                        </select>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${
                            isOverdue
                              ? 'text-red-400 font-black'
                              : isDone
                              ? 'text-[#555]'
                              : 'text-[#888]'
                          }`}
                        >
                          <Calendar className="w-3 h-3 text-[#555]" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 flex items-center justify-center text-white text-[9px] font-black uppercase"
                              style={{ backgroundColor: assignee.color }}
                            >
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[#ccc] font-bold text-xs uppercase tracking-tight">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#555] font-mono text-xs uppercase">UNASSIGNED</span>
                        )}
                      </td>

                      {/* Subtasks Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {totalSubtasks > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#777] font-mono text-[10px]">
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                            <div className="w-16 h-1 bg-[#222] overflow-hidden">
                              <div
                                className={`h-full ${
                                  completedSubtasks === totalSubtasks
                                    ? 'bg-emerald-500'
                                    : 'bg-[#3B82F6]'
                                }`}
                                style={{
                                  width: `${Math.round(
                                    (completedSubtasks / totalSubtasks) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#333] font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditTaskModal(task)}
                            title="Edit"
                            className="p-1 text-[#666] hover:text-[#3B82F6] hover:bg-[#1a1a1a] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser?.role !== 'viewer' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete task "${task.title}"?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              title="Delete"
                              className="p-1 text-[#666] hover:text-red-400 hover:bg-[#250c0c] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
