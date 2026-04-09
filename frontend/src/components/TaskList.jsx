import { useState } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/tasks';
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const TaskList = ({ tasks, loading, onEdit, onRefresh, search = '', sort = 'newest' }) => {
  const [filter, setFilter] = useState('all');

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/${task._id}`, { ...task, completed: !task.completed });
      onRefresh();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      onRefresh();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = tasks
    .filter(t => {
      const matchesFilter =
        filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'dueDate') return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  if (loading) return (
    <div className="grid gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-gray-200 mt-1" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition
              ${filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">
            {search ? 'No tasks match your search' : 'No tasks here yet'}
          </p>
          <p className="text-sm mt-1">
            {search ? 'Try a different keyword' : 'Click "New Task" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
