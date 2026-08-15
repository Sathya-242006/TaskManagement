import React from 'react';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  User as UserIcon,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, TaskStatus } from '../types';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    categories,
    users,
    tasks,
    filteredTasks,
  } = useTasks();

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.assigneeId !== 'all' ? 1 : 0);

  const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priority' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  // Quick stats
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const due = new Date(t.dueDate).setHours(23, 59, 59, 999);
    return due < Date.now();
  }).length;

  return (
    <div className="bg-[#0A0A0A] border-b border-[#222] pt-8 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Bold Typography Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tighter uppercase text-white select-none">
              TASKS<span className="text-[#3B82F6]">.</span>
            </h1>
            <p className="mt-2 text-[#777] text-xs sm:text-sm max-w-xl font-medium">
              Manage your active sprint cycles, review bottlenecks, and track high-velocity deliverables.
            </p>
          </div>

          <div className="flex items-center gap-6 self-start md:self-end">
            <div className="text-left md:text-right">
              <div className="text-3xl sm:text-4xl font-black leading-none text-white font-mono">
                {tasks.length - completedCount}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mt-1">
                Pending Tasks
              </p>
            </div>

            <div className="text-left md:text-right border-l border-[#222] pl-6">
              <div className="text-3xl sm:text-4xl font-black leading-none text-[#3B82F6] font-mono">
                {completedCount}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mt-1">
                Completed
              </p>
            </div>
          </div>
        </div>

        {/* Search & Quick Stat Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-[#222]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-tasks-input"
              type="text"
              placeholder="SEARCH BY TITLE, TAG, CATEGORY..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 text-xs font-bold uppercase tracking-wider bg-[#121212] border border-[#262626] focus:border-[#3B82F6] focus:outline-none text-white placeholder-[#555] transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stat Badges */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider overflow-x-auto pb-1 md:pb-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] bg-[#121212] text-[#888]">
              <span className="text-white font-mono">{filteredTasks.length}</span>
              <span>/ {tasks.length} SHOWN</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1e3a8a] bg-[#0c1e3d] text-[#60a5fa]">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{inProgressCount}</span> IN PROGRESS
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#065f46] bg-[#06261d] text-[#34d399]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-mono">{completedCount}</span> DONE
            </span>

            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#7f1d1d] bg-[#330c0c] text-[#f87171]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-mono">{overdueCount}</span> OVERDUE
              </span>
            )}
          </div>
        </div>

        {/* Filter Dropdowns & Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center">
              <select
                id="filter-status-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus | 'all',
                  }))
                }
                className="text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] px-3 py-1.5 text-[#ccc] hover:border-[#444] focus:border-[#3B82F6] focus:outline-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center">
              <select
                id="filter-priority-select"
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: e.target.value as TaskPriority | 'all',
                  }))
                }
                className="text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] px-3 py-1.5 text-[#ccc] hover:border-[#444] focus:border-[#3B82F6] focus:outline-none cursor-pointer"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center">
                <select
                  id="filter-category-select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] px-3 py-1.5 text-[#ccc] hover:border-[#444] focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#111] text-white">ALL CATEGORIES</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#111] text-white">
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Assignee Filter */}
            <div className="flex items-center">
              <select
                id="filter-assignee-select"
                value={filters.assigneeId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    assigneeId: e.target.value,
                  }))
                }
                className="text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] px-3 py-1.5 text-[#ccc] hover:border-[#444] focus:border-[#3B82F6] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#111] text-white">ALL ASSIGNEES</option>
                <option value="unassigned" className="bg-[#111] text-white">UNASSIGNED</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#111] text-white">
                    {u.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-red-400 hover:text-white bg-[#200a0a] border border-red-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                RESET ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] hidden sm:inline flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#3B82F6]" />
              SORT:
            </span>
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] px-3 py-1.5 text-[#ccc] hover:border-[#444] focus:border-[#3B82F6] focus:outline-none cursor-pointer"
            >
              <option value="order" className="bg-[#111] text-white">CUSTOM ORDER</option>
              <option value="dueDate" className="bg-[#111] text-white">DUE DATE</option>
              <option value="priority" className="bg-[#111] text-white">PRIORITY</option>
              <option value="createdAt" className="bg-[#111] text-white">CREATED DATE</option>
              <option value="title" className="bg-[#111] text-white">TITLE (A-Z)</option>
            </select>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                }))
              }
              title={`Toggle sort order (current: ${filters.sortOrder})`}
              className="px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-[#121212] border border-[#262626] text-[#888] hover:text-white hover:border-[#444] transition-colors"
            >
              {filters.sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
