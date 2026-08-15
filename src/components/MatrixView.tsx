import React from 'react';
import { Flame, Clock, Users, Coffee, Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { useAuth } from '../context/AuthContext';

export const MatrixView: React.FC = () => {
  const { filteredTasks, openCreateTaskModal } = useTasks();
  const { user } = useAuth();

  // Quadrant 1: Urgent & Critical (Urgent priority or High + Due soon)
  const q1Tasks = filteredTasks.filter(
    (t) => t.priority === 'urgent' && t.status !== 'done'
  );

  // Quadrant 2: Important, Not Urgent (High priority, not due immediately)
  const q2Tasks = filteredTasks.filter(
    (t) => t.priority === 'high' && t.status !== 'done'
  );

  // Quadrant 3: Medium Priority (Delegate / Move quickly)
  const q3Tasks = filteredTasks.filter(
    (t) => t.priority === 'medium' && t.status !== 'done'
  );

  // Quadrant 4: Low Priority & Completed
  const q4Tasks = filteredTasks.filter(
    (t) => t.priority === 'low' || t.status === 'done'
  );

  const quadrants = [
    {
      id: 'q1',
      title: 'Do First (Urgent & Critical)',
      desc: 'Immediate action required — bottlenecks and deadlines',
      icon: <Flame className="w-4 h-4 text-red-400" />,
      tasks: q1Tasks,
      bg: 'bg-[#120808]',
      border: 'border-red-900/60',
      accent: 'text-red-400',
      badge: 'border border-red-500 bg-[#2b0c0c] text-red-300',
      defaultPriority: 'urgent' as const,
    },
    {
      id: 'q2',
      title: 'Schedule & Focus (Strategic)',
      desc: 'High value strategic initiatives for long-term impact',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      tasks: q2Tasks,
      bg: 'bg-[#120e06]',
      border: 'border-amber-900/60',
      accent: 'text-amber-400',
      badge: 'border border-amber-500 bg-[#2b1e0c] text-amber-300',
      defaultPriority: 'high' as const,
    },
    {
      id: 'q3',
      title: 'Quick Wins & Execution',
      desc: 'Standard tasks, routine iterations, and operational steps',
      icon: <Users className="w-4 h-4 text-[#3B82F6]" />,
      tasks: q3Tasks,
      bg: 'bg-[#080f1a]',
      border: 'border-blue-900/60',
      accent: 'text-[#60a5fa]',
      badge: 'border border-[#3B82F6] bg-[#0c1e3d] text-[#60a5fa]',
      defaultPriority: 'medium' as const,
    },
    {
      id: 'q4',
      title: 'Backlog & Completed',
      desc: 'Low priority backlog items and archived milestones',
      icon: <Coffee className="w-4 h-4 text-[#888]" />,
      tasks: q4Tasks,
      bg: 'bg-[#0c0c0c]',
      border: 'border-[#222]',
      accent: 'text-white',
      badge: 'border border-[#333] bg-[#161616] text-[#888]',
      defaultPriority: 'low' as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          Eisenhower Priority Matrix<span className="text-[#3B82F6]">.</span>
        </h2>
        <p className="text-xs text-[#666] uppercase font-bold tracking-[0.15em] mt-1">
          Categorize tasks by urgency and impact to optimize team throughput
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quadrants.map((quad, quadIdx) => (
          <div
            key={quad.id}
            className={`border ${quad.border} ${quad.bg} p-5 flex flex-col min-h-[380px] shadow-sm`}
          >
            {/* Quadrant Header */}
            <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#222]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#161616] border border-[#333] mt-0.5">
                  {quad.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#555] font-bold">0{quadIdx + 1}</span>
                    <h3 className={`text-xs font-black uppercase tracking-wider ${quad.accent}`}>{quad.title}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.2 font-bold ${quad.badge}`}>
                      {quad.tasks.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#666] mt-0.5 font-medium">{quad.desc}</p>
                </div>
              </div>

              {user?.role !== 'viewer' && (
                <button
                  onClick={() => openCreateTaskModal('todo')}
                  className="p-1 text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#333]"
                  title="Add task in this quadrant"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quadrant Task List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px]">
              {quad.tasks.length === 0 ? (
                <div className="h-32 border border-dashed border-[#222] flex items-center justify-center p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#555]">No tasks in this quadrant</p>
                </div>
              ) : (
                quad.tasks.map((task) => <TaskCard key={task.id} task={task} compact />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
