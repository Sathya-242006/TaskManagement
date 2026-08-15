import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Calendar,
  User,
  Tag,
  MessageSquare,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { api } from '../services/api';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    closeTaskModal,
    selectedTask,
    modalDefaultStatus,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    users,
    categories,
  } = useTasks();

  const { user: currentUser } = useAuth();
  const isEditing = !!selectedTask;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Subtask & Comment inputs
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description);
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setCategory(selectedTask.category || 'General');
      setDueDate(selectedTask.dueDate);
      setAssigneeId(selectedTask.assigneeId || '');
      setTags(selectedTask.tags || []);
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setStatus(modalDefaultStatus || 'todo');
      setPriority('medium');
      setCategory('Frontend');
      const defaultDue = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      setDueDate(defaultDue);
      setAssigneeId(currentUser?.id || '');
      setTags(['Feature']);
    }
    setActiveTab('details');
  }, [selectedTask, modalDefaultStatus, currentUser]);

  if (!isTaskModalOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && selectedTask) {
      await updateTask(selectedTask.id, {
        title,
        description,
        status,
        priority,
        category,
        dueDate,
        assigneeId: assigneeId || undefined,
        tags,
      });
      closeTaskModal();
    } else {
      await createTask({
        title,
        description,
        status,
        priority,
        category,
        dueDate,
        assigneeId: assigneeId || undefined,
        tags,
      });
    }
  };

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      alert('Please enter a task title first so AI can analyze it.');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await api.generateAiBreakdown({
        title,
        description,
        category,
      });

      if (res.enhancedDescription && !description) {
        setDescription(res.enhancedDescription);
      }
      if (res.suggestedPriority) {
        setPriority(res.suggestedPriority as TaskPriority);
      }
      if (res.suggestedTags && res.suggestedTags.length > 0) {
        const combined = Array.from(new Set([...tags, ...res.suggestedTags]));
        setTags(combined);
      }

      // If editing, add suggested subtasks
      if (isEditing && selectedTask && res.suggestedSubtasks) {
        for (const st of res.suggestedSubtasks) {
          await addSubtask(selectedTask.id, st);
        }
        setActiveTab('subtasks');
      }
    } catch (err) {
      console.error('AI Breakdown error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;
    await addSubtask(selectedTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTask) return;
    await addComment(selectedTask.id, commentInput.trim());
    setCommentInput('');
  };

  const isReadOnly = currentUser?.role === 'viewer';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#222] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black uppercase tracking-tight text-white">
              {isEditing ? 'TASK DETAILS' : 'CREATE NEW TASK'}
              <span className="text-[#3B82F6]">.</span>
            </h2>
            {isEditing && selectedTask && (
              <span className="text-[10px] px-2 py-0.5 font-mono font-bold uppercase tracking-wider bg-[#1c1c1c] text-[#3B82F6] border border-[#333]">
                {selectedTask.id.split('-').slice(0, 2).join('-')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* AI Assistant Button in Modal */}
            <button
              type="button"
              onClick={handleAiBreakdown}
              disabled={isAiLoading || !title.trim()}
              title="Generate subtasks & enhance description using Gemini AI"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#60a5fa] bg-[#0c1e3d] border border-[#1e3a8a] hover:bg-[#132c54] disabled:opacity-50 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'ANALYZING...' : 'AI ENHANCE'}</span>
            </button>

            <button
              onClick={closeTaskModal}
              className="p-1 text-[#666] hover:text-white hover:bg-[#1c1c1c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher for Editing */}
        {isEditing && selectedTask && (
          <div className="flex border-b border-[#222] px-6 bg-[#101010]">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-[#666] hover:text-white'
              }`}
            >
              General Details
            </button>
            <button
              onClick={() => setActiveTab('subtasks')}
              className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'subtasks'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-[#666] hover:text-white'
              }`}
            >
              <span>Subtasks</span>
              <span className="px-1.5 py-0.2 bg-[#1a1a1a] border border-[#333] text-[#aaa] font-mono text-[10px]">
                {selectedTask.subtasks.filter((s) => s.completed).length}/
                {selectedTask.subtasks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-[#666] hover:text-white'
              }`}
            >
              <span>Discussion</span>
              <span className="px-1.5 py-0.2 bg-[#1a1a1a] border border-[#333] text-[#aaa] font-mono text-[10px]">
                {selectedTask.comments.length}
              </span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'details' && (
            <form id="task-details-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  disabled={isReadOnly}
                  placeholder="e.g. Implement user authentication tokens"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold placeholder-[#555]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Description & Requirements
                </label>
                <textarea
                  id="task-desc-input"
                  rows={3}
                  disabled={isReadOnly}
                  placeholder="Add details, edge cases, requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white placeholder-[#555]"
                />
              </div>

              {/* Two Column Grid: Status, Priority, Category, Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                    Status
                  </label>
                  <select
                    id="task-status-select"
                    disabled={isReadOnly}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold uppercase"
                  >
                    <option value="todo" className="bg-[#111]">TO DO</option>
                    <option value="in_progress" className="bg-[#111]">IN PROGRESS</option>
                    <option value="in_review" className="bg-[#111]">IN REVIEW</option>
                    <option value="done" className="bg-[#111]">DONE (COMPLETED)</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                    Priority
                  </label>
                  <select
                    id="task-priority-select"
                    disabled={isReadOnly}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold uppercase"
                  >
                    <option value="urgent" className="bg-[#111]">URGENT (CRITICAL)</option>
                    <option value="high" className="bg-[#111]">HIGH</option>
                    <option value="medium" className="bg-[#111]">MEDIUM</option>
                    <option value="low" className="bg-[#111]">LOW</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                    Category / Department
                  </label>
                  <input
                    id="task-category-input"
                    type="text"
                    disabled={isReadOnly}
                    list="category-suggestions"
                    placeholder="e.g. Backend, Frontend, Design"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-medium uppercase"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                    Assignee
                  </label>
                  <select
                    id="task-assignee-select"
                    disabled={isReadOnly}
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold uppercase"
                  >
                    <option value="" className="bg-[#111]">UNASSIGNED</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="bg-[#111]">
                        {u.name} ({u.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                    Due Date
                  </label>
                  <input
                    id="task-duedate-input"
                    type="date"
                    disabled={isReadOnly}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white font-bold"
                  />
                </div>
              </div>

              {/* Tags Chip Field */}
              <div>
                <label className="block text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-1.5">
                  Tags & Labels
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#141414] border border-[#282828] min-h-[40px] items-center">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0c1e3d] text-[#60a5fa] border border-[#1e3a8a] text-[10px] font-mono uppercase font-bold"
                    >
                      #{tag}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#60a5fa] hover:text-white ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="ADD TAG..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="text-xs bg-transparent border-0 focus:outline-none text-white placeholder-[#555] font-mono w-24 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="text-xs text-[#3B82F6] hover:text-white font-black px-1"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && isEditing && selectedTask && (
            <div className="space-y-4">
              {!isReadOnly && (
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an actionable checklist step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white placeholder-[#555]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors shrink-0"
                  >
                    + ADD STEP
                  </button>
                </form>
              )}

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedTask.subtasks.length === 0 ? (
                  <p className="text-xs text-[#666] py-6 text-center font-mono">
                    No subtasks yet. Click "AI ENHANCE" or add your first step above.
                  </p>
                ) : (
                  selectedTask.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center justify-between p-3 border transition-colors ${
                        sub.completed
                          ? 'bg-[#0a0a0a] border-[#1c1c1c] text-[#555]'
                          : 'bg-[#141414] border-[#262626] text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => toggleSubtask(selectedTask.id, sub.id, !sub.completed)}
                          className="shrink-0 text-[#666] hover:text-emerald-400 transition-colors"
                        >
                          {sub.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#555] hover:text-[#3B82F6]" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-medium truncate ${
                            sub.completed ? 'line-through text-[#666]' : ''
                          }`}
                        >
                          {sub.title}
                        </span>
                      </div>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => deleteSubtask(selectedTask.id, sub.id)}
                          className="text-[#666] hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && isEditing && selectedTask && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedTask.comments.length === 0 ? (
                  <p className="text-xs text-[#666] py-6 text-center font-mono">
                    No comments yet. Start the discussion below.
                  </p>
                ) : (
                  selectedTask.comments.map((comm) => (
                    <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                      <div
                        className="w-6 h-6 flex items-center justify-center text-white text-[9px] font-black uppercase shrink-0 mt-0.5"
                        style={{ backgroundColor: comm.userColor }}
                      >
                        {comm.userName.charAt(0)}
                      </div>
                      <div className="flex-1 bg-[#141414] p-3 border border-[#222]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white uppercase text-xs tracking-tight">{comm.userName}</span>
                          <span className="text-[10px] font-mono text-[#555]">
                            {new Date(comm.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[#ccc] leading-relaxed">{comm.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-3 border-t border-[#222]">
                <input
                  type="text"
                  placeholder="Write a comment or team update..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#141414] border border-[#282828] focus:outline-none focus:border-[#3B82F6] text-white placeholder-[#555]"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#121212] border-t border-[#222] flex items-center justify-between">
          <div>
            {isEditing && selectedTask && !isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete task "${selectedTask.title}"?`)) {
                    deleteTask(selectedTask.id);
                  }
                }}
                className="text-xs text-red-400 hover:text-white font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DELETE TASK
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-[#888] hover:text-white border border-[#333] hover:border-[#666] transition-colors"
            >
              CLOSE
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                form="task-details-form"
                className="px-5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#3B82F6] hover:bg-white transition-colors"
              >
                {isEditing ? 'SAVE CHANGES' : 'CREATE TASK'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
