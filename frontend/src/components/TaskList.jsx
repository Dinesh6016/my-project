import { useState } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';
import toast from 'react-hot-toast';
import { ClipboardList, Trash2 } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const DeleteModal = ({ onConfirm, onCancel, dark }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className={`rounded-2xl p-6 w-full max-w-sm shadow-xl ${dark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <Trash2 size={22} className="text-red-600" />
      </div>
      <h3 className={`text-center font-semibold text-base mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Delete Task?</h3>
      <p className={`text-center text-sm mb-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const TaskList = ({ tasks, loading, onEdit, onRefresh, search = '', sort = 'newest', dark = false }) => {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/${task._id}`, { ...task, completed: !task.completed });
      onRefresh();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      onRefresh();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleteId(null);
    }
  };

  const categories = ['all', ...new Set(tasks.map(t => t.category).filter(Boolean))];

  const filtered = tasks
    .filter(t => {
      const matchesStatus = filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesSearch = !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'dueDate') return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const countFor = (f) => tasks.filter(t => f === 'all' ? true : f === 'pending' ? !t.completed : t.completed).length;

  const tabCls = (f) => `px-4 py-1.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5
    ${filter === f
      ? 'bg-blue-600 text-white'
      : dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`;

  if (loading) return (
    <div className="grid gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className={`rounded-2xl p-5 border animate-pulse ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-gray-300/40 mt-1" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300/40 rounded w-2/3" />
              <div className="h-3 bg-gray-200/40 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={tabCls(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : dark ? 'bg-gray-600' : 'bg-gray-100'}`}>
              {countFor(f)}
            </span>
          </button>
        ))}
      </div>

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition
                ${categoryFilter === c
                  ? 'bg-indigo-600 text-white'
                  : dark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          <ClipboardList size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">{search ? 'No tasks match your search' : 'No tasks here yet'}</p>
          <p className="text-sm mt-1">{search ? 'Try a different keyword' : 'Click "New Task" to get started'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleComplete}
              onDelete={(id) => setDeleteId(id)}
              onEdit={onEdit}
              dark={dark}
            />
          ))}
        </div>
      )}

      {deleteId && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} dark={dark} />
      )}
    </div>
  );
};

export default TaskList;
