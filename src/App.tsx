import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { MatrixView } from './components/MatrixView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AuthModal } from './components/AuthModal';
import { Loader2 } from 'lucide-react';

const MainWorkspace: React.FC = () => {
  const { viewMode, isLoading } = useTasks();
  const { isLoading: authLoading } = useAuth();

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#777]">Loading TaskFlow Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#3B82F6] selection:text-black">
      {/* App Header */}
      <Header />

      {/* Filter toolbar (shown for board, list, calendar, matrix) */}
      {viewMode !== 'analytics' && <FilterBar />}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'calendar' && <CalendarView />}
        {viewMode === 'matrix' && <MatrixView />}
        {viewMode === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modals */}
      <TaskModal />
      <AiAssistantModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainWorkspace />
      </TaskProvider>
    </AuthProvider>
  );
}
