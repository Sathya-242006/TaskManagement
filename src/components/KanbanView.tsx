import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Eye, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';
import { useAuth } from '../context/AuthContext';

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  headerColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const KanbanView: React.FC = () => {
  const { filteredTasks, openCreateTaskModal, moveTaskStatus } = useTasks();
  const { user } = useAuth();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: ColumnConfig[] = [
    {
      id: 'todo',
      title: 'To Do',
      icon: <Circle className="w-3.5 h-3.5 text-[#888]" />,
      headerColor: 'text-white',
      badgeBg: 'bg-[#1a1a1a] border border-[#333]',
      badgeText: 'text-[#aaa]',
      borderColor: 'border-t-[#555]',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />,
      headerColor: 'text-white',
      badgeBg: 'bg-[#0c1e3d] border border-[#1e3a8a]',
      badgeText: 'text-[#60a5fa]',
      borderColor: 'border-t-[#3B82F6]',
    },
    {
      id: 'in_review',
      title: 'In Review',
      icon: <Eye className="w-3.5 h-3.5 text-purple-400" />,
      headerColor: 'text-white',
      badgeBg: 'bg-[#200c30] border border-purple-900',
      badgeText: 'text-purple-300',
      borderColor: 'border-t-purple-500',
    },
    {
      id: 'done',
      title: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      headerColor: 'text-white',
      badgeBg: 'bg-[#06261d] border border-[#065f46]',
      badgeText: 'text-emerald-300',
      borderColor: 'border-t-emerald-500',
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (taskId && user?.role !== 'viewer') {
      await moveTaskStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col, colIdx) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              id={`kanban-col-${col.id}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-[#0e0e0e] border ${
                isOver ? 'border-[#3B82F6] bg-[#141d2b] ring-1 ring-[#3B82F6]' : 'border-[#222]'
              } ${col.borderColor} border-t-2 p-3.5 flex flex-col min-h-[520px] transition-all`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#555] font-bold">0{colIdx + 1}</span>
                  {col.icon}
                  <h2 className="text-xs font-black uppercase tracking-wider text-white">{col.title}</h2>
                  <span
                    className={`text-[10px] px-2 py-0.2 font-mono font-bold ${col.badgeBg} ${col.badgeText}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {user?.role !== 'viewer' && (
                  <button
                    id={`add-task-col-${col.id}`}
                    onClick={() => openCreateTaskModal(col.id)}
                    title={`Add task to ${col.title}`}
                    className="p-1 text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#333]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Task Cards List */}
              <div className="flex-1 space-y-2.5">
                {colTasks.length === 0 ? (
                  <div
                    onClick={() => user?.role !== 'viewer' && openCreateTaskModal(col.id)}
                    className="h-28 border border-dashed border-[#222] flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-[#3B82F6] hover:bg-[#141414] transition-colors group"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#555] font-bold">No tasks in {col.title}</p>
                    {user?.role !== 'viewer' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] mt-1 group-hover:underline">
                        + Add task
                      </span>
                    )}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={user?.role !== 'viewer'}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={draggedTaskId === task.id ? 'opacity-40' : ''}
                    >
                      <TaskCard task={task} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
