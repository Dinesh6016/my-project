import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { LogOut, Plus, BookOpen, CheckCircle2, Clock, AlertTriangle, Moon, Sun, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

const StatCard = ({ icon: Icon, label, value, color, dark }) => (
  <div className={`rounded-2xl p-4 border flex items-center gap-3 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTask(null); };
  const handleTaskSaved = () => { closeForm(); fetchTasks(); };

  const markAllComplete = async () => {
    const pending = tasks.filter(t => !t.completed);
    if (!pending.length) return toast('All tasks already completed!');
    try {
      await Promise.all(pending.map(t => axios.put(`${API_URL}/${t._id}`, { ...t, completed: true })));
      fetchTasks();
      toast.success(`${pending.length} tasks marked complete`);
    } catch {
      toast.error('Failed to update tasks');
    }
  };

  const now = new Date();
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-gray-400' : 'text-gray-500';
  const inputCls = `px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'}`;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200`}>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EduTask</h1>
              <p className="text-blue-200 text-xs">Student Task Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              title="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {(user?.name || 'S')[0].toUpperCase()}
              </div>
              <span className="text-white text-sm">{user?.name || 'Student'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Total" value={tasks.length} color="bg-blue-500" dark={dark} />
          <StatCard icon={Clock} label="Pending" value={pending} color="bg-amber-500" dark={dark} />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} color="bg-green-500" dark={dark} />
          <StatCard icon={AlertTriangle} label="Overdue" value={overdue} color="bg-red-500" dark={dark} />
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${text}`}>Overall Progress</span>
              <span className={`text-sm font-bold ${progress === 100 ? 'text-green-500' : 'text-blue-500'}`}>{progress}%</span>
            </div>
            <div className={`w-full h-2.5 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={`text-xs mt-2 ${subtext}`}>{completed} of {tasks.length} tasks completed</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className={`text-lg font-semibold ${text}`}>My Tasks</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className={`${inputCls} w-full sm:w-44`}
            />
            <select value={sort} onChange={e => setSort(e.target.value)} className={inputCls}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={markAllComplete}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Mark All Done</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <Plus size={16} />
              New Task
            </button>
          </div>
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={handleEdit}
          onRefresh={fetchTasks}
          search={search}
          sort={sort}
          dark={dark}
        />

        {showForm && (
          <TaskForm task={editingTask} onClose={closeForm} onTaskSaved={handleTaskSaved} dark={dark} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
