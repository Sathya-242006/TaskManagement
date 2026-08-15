import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Layers, Tag, CheckSquare } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { api } from '../services/api';
import { TaskPriority, TaskStatus } from '../types';

export const AiAssistantModal: React.FC = () => {
  const { isAiModalOpen, closeAiModal, createTask, categories } = useTasks();

  const [promptGoal, setPromptGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    title: string;
    enhancedDescription: string;
    suggestedSubtasks: string[];
    suggestedPriority: TaskPriority;
    suggestedTags: string[];
  } | null>(null);

  if (!isAiModalOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptGoal.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.generateAiBreakdown({
        title: promptGoal,
        category: selectedCategory,
      });

      setGeneratedPlan({
        title: promptGoal.trim(),
        enhancedDescription: res.enhancedDescription,
        suggestedSubtasks: res.suggestedSubtasks || [],
        suggestedPriority: (res.suggestedPriority as TaskPriority) || 'high',
        suggestedTags: res.suggestedTags || ['AI-Generated', selectedCategory],
      });
    } catch (err) {
      console.error('AI Generator Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaskFromAi = async () => {
    if (!generatedPlan) return;

    const newTask = await createTask({
      title: generatedPlan.title,
      description: generatedPlan.enhancedDescription,
      priority: generatedPlan.suggestedPriority,
      status: 'todo' as TaskStatus,
      category: selectedCategory,
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      tags: generatedPlan.suggestedTags,
    });

    // Add subtasks
    for (const sub of generatedPlan.suggestedSubtasks) {
      await api.addSubtask(newTask.id, sub);
    }

    closeAiModal();
    setGeneratedPlan(null);
    setPromptGoal('');
  };

  const presetGoals = [
    'Implement OAuth2 Google Workspace single sign-on',
    'Design mobile responsive checkout flow & stripe webhook',
    'Set up automated CI/CD pipeline and integration test suite',
    'Optimize Postgres database indexing and slow query analyzer',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#222] shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3B82F6] text-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-white">
                GEMINI TASK ARCHITECT<span className="text-[#3B82F6]">.</span>
              </h2>
              <p className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Deconstruct objectives into actionable plans</p>
            </div>
          </div>

          <button
            onClick={closeAiModal}
            className="p-1 text-[#666] hover:text-white hover:bg-[#1c1c1c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Describe what you want to accomplish
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Build end-to-end user profile page with OAuth, avatar upload, and security settings..."
                  value={promptGoal}
                  onChange={(e) => setPromptGoal(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white placeholder-[#555]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold uppercase"
                >
                  <option value="Frontend" className="bg-[#111]">FRONTEND</option>
                  <option value="Backend" className="bg-[#111]">BACKEND</option>
                  <option value="Design" className="bg-[#111]">DESIGN & UI/UX</option>
                  <option value="DevOps" className="bg-[#111]">DEVOPS & CLOUD</option>
                  <option value="Security" className="bg-[#111]">SECURITY & AUTH</option>
                  <option value="Marketing" className="bg-[#111]">GROWTH & MARKETING</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] mb-2">
                  Or pick an example goal:
                </p>
                <div className="space-y-1.5">
                  {presetGoals.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptGoal(preset)}
                      className="w-full text-left px-3 py-2 text-xs border border-[#222] hover:border-[#3B82F6] bg-[#141414] hover:bg-[#1a1a1a] text-[#aaa] hover:text-white transition-colors flex items-center gap-2 font-mono"
                    >
                      <span className="text-[#3B82F6]">▶</span> {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !promptGoal.trim()}
                  className="w-full py-3 px-4 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'ARCHITECTING PLAN WITH AI...' : 'GENERATE ACTIONABLE TASK PLAN'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[#141414] border border-[#282828] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6]">
                    {selectedCategory}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 font-mono font-bold bg-[#261505] text-[#f59e0b] border border-[#78350f] uppercase">
                    {generatedPlan.suggestedPriority} PRIORITY
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase text-white">{generatedPlan.title}</h3>
                <p className="text-xs text-[#aaa] leading-relaxed">
                  {generatedPlan.enhancedDescription}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {generatedPlan.suggestedTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 bg-[#0c1e3d] text-[#60a5fa] font-mono font-bold border border-[#1e3a8a] uppercase"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div>
                <h4 className="text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                  GENERATED ACTION STEPS ({generatedPlan.suggestedSubtasks.length})
                </h4>
                <div className="space-y-1.5">
                  {generatedPlan.suggestedSubtasks.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#141414] border border-[#222] text-xs text-white flex items-center gap-2.5 font-medium"
                    >
                      <span className="w-4 h-4 bg-[#1e3a8a] text-[#60a5fa] text-[9px] font-mono font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider text-[#888] hover:text-white border border-[#333] hover:border-[#666] transition-colors"
                >
                  ← EDIT PROMPT
                </button>
                <button
                  type="button"
                  onClick={handleCreateTaskFromAi}
                  className="flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>CREATE TASK & CHECKLIST</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
