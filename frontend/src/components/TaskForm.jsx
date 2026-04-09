import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;
const CATEGORIES = ['General', 'Math', 'Science', 'English', 'History', 'Project', 'Exam Prep', 'Other'];

const TaskForm = ({ task, onClose, onTaskSaved, dark = false }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || 'General');
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload = { title, description, dueDate, priority, category };
      if (isEditing) {
        await axios.put(`${API_URL}/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        await axios.post(API_URL, payload);
        toast.success('Task created!');
      }
      onTaskSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
    ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden ${dark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
              <span className={`text-xs ${title.length > 80 ? 'text-red-500' : dark ? 'text-gray-500' : 'text-gray-400'}`}>{title.length}/100</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => e.target.value.length <= 100 && setTitle(e.target.value)}
              className={inputCls}
              placeholder="e.g. Finish Math Assignment"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`${inputCls} h-20 resize-none`}
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className={`flex-1 py-2.5 border rounded-xl text-sm font-medium transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-70">
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
