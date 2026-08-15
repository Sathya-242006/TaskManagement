import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Task, TaskPriority } from '../types';
import { useAuth } from '../context/AuthContext';

export const CalendarView: React.FC = () => {
  const { filteredTasks, openEditTaskModal, openCreateTaskModal } = useTasks();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const priorityColors: Record<TaskPriority, string> = {
    urgent: 'bg-[#3d0e0e] border border-red-500 text-red-300 font-bold',
    high: 'bg-[#3d220e] border border-amber-500 text-amber-300 font-bold',
    medium: 'bg-[#0c1e3d] border border-[#1e3a8a] text-[#60a5fa] font-bold',
    low: 'bg-[#1a1a1a] border border-[#333] text-[#aaa]',
  };

  // Build calendar matrix
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getTasksForDay = (day: number): Task[] => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredTasks.filter((t) => t.dueDate === formattedDate);
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Calendar Header Controls */}
      <div className="bg-[#0e0e0e] border border-[#222] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#161616] border border-[#333] text-[#3B82F6]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#666]">Track task due dates across the month</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-[#141414] border border-[#333] p-0.5">
            <button
              onClick={prevMonth}
              className="p-1 text-[#888] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 text-[#888] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#0e0e0e] border-x border-b border-[#222] overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#222] bg-[#141414] text-center py-2.5 text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">
          {days.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#1c1c1c] min-h-[550px]">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-[#080808] p-2 min-h-[90px]" />;
            }

            const dayTasks = getTasksForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`p-2 min-h-[100px] flex flex-col group hover:bg-[#141414] transition-colors ${
                  isCurrentDay ? 'bg-[#0f1d33]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center ${
                      isCurrentDay
                        ? 'bg-[#3B82F6] text-black font-black'
                        : 'text-[#aaa]'
                    }`}
                  >
                    {day}
                  </span>

                  {user?.role !== 'viewer' && (
                    <button
                      onClick={() => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                          day
                        ).padStart(2, '0')}`;
                        openCreateTaskModal('todo');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[#666] hover:text-[#3B82F6] hover:bg-[#202020] transition-all"
                      title="Add task on this day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[90px]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openEditTaskModal(task)}
                      title={`${task.title} (${task.status})`}
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase truncate cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1 ${
                        task.status === 'done'
                          ? 'bg-[#181818] border border-[#282828] text-[#555] line-through'
                          : priorityColors[task.priority]
                      }`}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
