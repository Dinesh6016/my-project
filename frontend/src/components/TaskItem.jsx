import { Edit, Trash2, Calendar, Flame, ArrowUp, Minus } from 'lucide-react';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   icon: Flame,   bg: 'bg-red-100',   text: 'text-red-700'   },
  medium: { label: 'Medium', icon: ArrowUp,  bg: 'bg-amber-100', text: 'text-amber-700' },
  low:    { label: 'Low',    icon: Minus,    bg: 'bg-green-100', text: 'text-green-700' },
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, dark = false }) => {
  const now = new Date();
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && due < now && !task.completed;
  const isDueToday = due &&
    due.toDateString() === now.toDateString() && !task.completed;

  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PIcon = p.icon;

  const cardBg = dark
    ? `bg-gray-800 border-gray-700 ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`
    : `bg-white ${isOverdue ? 'border-red-200 border-l-4 border-l-red-500' : 'border-gray-100'}`;

  return (
    <div className={`rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:shadow-md group ${cardBg} ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-blue-400'}`}
        >
          {task.completed && <span className="text-white text-xs font-bold">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-sm leading-snug ${task.completed ? 'line-through text-gray-400' : dark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {isDueToday && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">Due Today</span>
            )}
          </div>

          {task.description && (
            <p className={`mt-1 text-xs line-clamp-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${p.bg} ${p.text}`}>
              <PIcon size={10} />{p.label}
            </span>

            {task.category && task.category !== 'General' && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                {task.category}
              </span>
            )}

            {due && (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium
                ${isOverdue ? 'bg-red-100 text-red-600' : dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                <Calendar size={10} />
                {isOverdue ? 'Overdue · ' : ''}
                {due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className={`p-1.5 rounded-lg transition ${dark ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-500 hover:bg-blue-50'}`} title="Edit">
            <Edit size={15} />
          </button>
          <button onClick={() => onDelete(task._id)} className={`p-1.5 rounded-lg transition ${dark ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-red-50'}`} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
