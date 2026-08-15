import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Activity as ActivityIcon,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const AnalyticsView: React.FC = () => {
  const { tasks, users, activities, isRealtimeConnected } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in_review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority counts
  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  // Subtasks statistics
  const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
    0
  );
  const subtaskRate =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          Team Performance & Analytics<span className="text-[#3B82F6]">.</span>
        </h2>
        <p className="text-xs text-[#666] uppercase font-bold tracking-[0.15em] mt-1">
          Real-time metrics, pipeline distribution, and velocity tracking
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Completion Rate</span>
            <div className="p-1.5 bg-[#06261d] border border-emerald-900 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-white">{completionRate}%</span>
            <span className="text-[11px] font-mono text-[#666]">
              ({completedTasks}/{totalTasks})
            </span>
          </div>
          <div className="w-full h-1 bg-[#1a1a1a] mt-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active In-Flight</span>
            <div className="p-1.5 bg-[#0c1e3d] border border-[#1e3a8a] text-[#3B82F6]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-white">
              {inProgressTasks + inReviewTasks}
            </span>
            <span className="text-[11px] text-[#666] uppercase font-bold tracking-tight">Active tasks</span>
          </div>
          <div className="flex items-center gap-3 mt-4 text-[10px] font-mono uppercase tracking-wider text-[#888]">
            <span className="text-[#3B82F6]">{inProgressTasks} Progress</span>
            <span>•</span>
            <span className="text-purple-400">{inReviewTasks} Review</span>
          </div>
        </div>

        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Checklist Items</span>
            <div className="p-1.5 bg-[#161616] border border-[#333] text-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-white">{subtaskRate}%</span>
            <span className="text-[11px] font-mono text-[#666]">
              ({completedSubtasks}/{totalSubtasks})
            </span>
          </div>
          <div className="w-full h-1 bg-[#1a1a1a] mt-4 overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] transition-all duration-500"
              style={{ width: `${subtaskRate}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <div className="flex items-center justify-between text-[#666] mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Urgent Attention</span>
            <div className="p-1.5 bg-[#2b0c0c] border border-red-900 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-red-500">{urgentCount}</span>
            <span className="text-[11px] text-[#666] uppercase font-bold tracking-tight">Critical tasks</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#666] mt-4">
            {urgentCount > 0 ? 'Immediate action required' : 'All clear on urgent items'}
          </p>
        </div>
      </div>

      {/* Middle Section: Workflow Breakdown & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3B82F6]" />
            Task Status Distribution
          </h3>

          <div className="space-y-3.5">
            {[
              { label: 'TO DO', count: todoTasks, color: 'bg-[#555]', textColor: 'text-[#aaa]' },
              { label: 'IN PROGRESS', count: inProgressTasks, color: 'bg-[#3B82F6]', textColor: 'text-[#60a5fa]' },
              { label: 'IN REVIEW', count: inReviewTasks, color: 'bg-purple-500', textColor: 'text-purple-400' },
              { label: 'COMPLETED', count: completedTasks, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
            ].map((st) => {
              const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`text-[10px] uppercase tracking-wider ${st.textColor}`}>{st.label}</span>
                    <span className="text-[#666] font-mono text-[10px]">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden">
                    <div
                      className={`h-full ${st.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-[#0e0e0e] p-5 border border-[#222]">
          <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3B82F6]" />
            Team Member Workload
          </h3>

          <div className="space-y-3.5">
            {users.map((u) => {
              const userTasks = tasks.filter((t) => t.assigneeId === u.id);
              const userCompleted = userTasks.filter((t) => t.status === 'done').length;
              const pct = totalTasks > 0 ? Math.round((userTasks.length / totalTasks) * 100) : 0;

              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 flex items-center justify-center text-white text-[10px] font-black uppercase shrink-0"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white text-xs uppercase tracking-tight truncate">{u.name}</span>
                      <span className="text-[#666] font-mono text-[10px]">
                        {userTasks.length} tasks ({userCompleted} done)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: u.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Activity Audit Feed */}
      <div className="bg-[#0e0e0e] p-5 border border-[#222]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Live Team Activity Stream</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 ${
                isRealtimeConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
            />
            {isRealtimeConnected ? 'REAL-TIME ACTIVE' : 'CONNECTING'}
          </span>
        </div>

        <div className="divide-y divide-[#181818] max-h-80 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-xs text-[#555] py-4 text-center font-mono">No recent activities recorded.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-start gap-3 text-xs">
                <div
                  className="w-6 h-6 flex items-center justify-center text-white text-[9px] font-black uppercase shrink-0 mt-0.5"
                  style={{ backgroundColor: act.userColor }}
                >
                  {act.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs">
                    <span className="font-bold text-[#ccc] uppercase tracking-tight">{act.userName}</span>{' '}
                    <span className="text-[#666]">
                      {act.action === 'created'
                        ? 'created task'
                        : act.action === 'status_change'
                        ? 'updated status of'
                        : act.action === 'commented'
                        ? 'commented on'
                        : act.action === 'subtask_toggle'
                        ? 'updated checklist on'
                        : act.action === 'deleted'
                        ? 'deleted task'
                        : 'updated'}
                    </span>{' '}
                    <span className="font-bold text-[#3B82F6]">"{act.taskTitle}"</span>
                  </p>
                  {act.details && <p className="text-[10px] text-[#666] font-mono mt-0.5">{act.details}</p>}
                </div>
                <span className="text-[10px] font-mono text-[#555] whitespace-nowrap shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
