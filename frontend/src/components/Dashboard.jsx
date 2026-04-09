import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { LogOut, Plus, BookOpen, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/tasks';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4`}>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
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

  const now = new Date();
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EduTask</h1>
              <p className="text-blue-200 text-xs">Student Task Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {(user?.name || 'S')[0].toUpperCase()}
              </div>
              <span className="text-white text-sm">{user?.name || 'Student'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Total Tasks" value={stats.total} color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-500" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-green-500" />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="bg-red-500" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-48"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition shadow-sm"
            >
              <Plus size={18} />
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
        />

        {showForm && (
          <TaskForm task={editingTask} onClose={closeForm} onTaskSaved={handleTaskSaved} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
