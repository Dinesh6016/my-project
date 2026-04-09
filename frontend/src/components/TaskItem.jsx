import { Edit, Trash2, Calendar, Flame, ArrowUp, Minus } from 'lucide-react';

const PRIORITY_CONFIG = {
  high:   { label: 'HIGH',   icon: Flame,   bg: 'bg-red-100',    text: 'text-red-700'    },
  medium: { label: 'MEDIUM', icon: ArrowUp,  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  low:    { label: 'LOW',    icon: Minus,    bg: 'bg-green-100',  text: 'text-green-700'  },
};

const TaskItem = ({ task, onToggle, onDelete, onEdit }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PIcon = p.icon;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md group
      ${task.completed ? 'opacity-60' : ''}
      ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-gray-100'}`}>

      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${task.completed
              ? 'bg-green-500 border-green-500 scale-110'
              : 'border-gray-300 hover:border-blue-400 hover:scale-110'}`}
        >
          {task.completed && <span className="text-white text-xs font-bold">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base leading-snug
            ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-gray-500 mt-1 text-sm line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${p.bg} ${p.text}`}>
              <PIcon size={11} />
              {p.label}
            </span>

            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium
                ${isOverdue
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-500'}`}>
                <Calendar size={11} />
                {isOverdue ? 'Overdue · ' : ''}
                {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}

            {task.completed && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                ✓ Done
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition"
            title="Edit"
          >
            <Edit size={17} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
