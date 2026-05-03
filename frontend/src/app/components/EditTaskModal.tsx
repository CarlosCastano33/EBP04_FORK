import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Select } from './Select';
import { Task, TaskPriority } from '../types';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onSave: (priority: TaskPriority, dueDate: number) => void;
  onCancel: () => void;
}

export function EditTaskModal({ isOpen, task, onSave, onCancel }: EditTaskModalProps) {
  const [priority, setPriority] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setPriority(task.priority || '');

      // Convertir timestamp a formato YYYY-MM-DD usando zona horaria local
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate('');
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Obtener fecha actual sin horas (solo año, mes, día)
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!priority) {
      newErrors.priority = 'La prioridad es obligatoria.';
    }

    if (!dueDate) {
      newErrors.dueDate = 'La fecha límite es obligatoria.';
    } else {
      // Convertir string YYYY-MM-DD a fecha local
      const [year, month, day] = dueDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);

      // Comparar solo fechas (sin horas)
      if (selectedDate < todayDateOnly) {
        newErrors.dueDate = 'La fecha límite no puede ser anterior a la fecha actual.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Crear fecha usando zona horaria local (no UTC)
    // dueDate viene en formato "YYYY-MM-DD"
    const [year, month, day] = dueDate.split('-').map(Number);
    const dueDateLocal = new Date(year, month - 1, day, 12, 0, 0); // Mediodía para evitar problemas de timezone
    const dueDateTimestamp = dueDateLocal.getTime();

    onSave(priority as TaskPriority, dueDateTimestamp);
    setErrors({});
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case 'Alta':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Baja':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={handleCancel}
    >
      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar tarea</h2>

        <div className="space-y-4 mb-6">
          {/* Nombre de la tarea (solo lectura) */}
          <div>
            <label className="block mb-2 text-sm text-gray-700 font-medium">
              Tarea
            </label>
            <p className="text-gray-800">{task.name}</p>
          </div>

          {/* Selector de prioridad con chips visuales */}
          <div>
            <label className="block mb-2 text-sm text-gray-700 font-medium">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Alta', 'Media', 'Baja'].map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setPriority(pri)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    priority === pri
                      ? getPriorityColor(pri)
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg mr-1">
                    {pri === 'Alta' ? '🔴' : pri === 'Media' ? '🟡' : '🟢'}
                  </span>
                  {pri}
                </button>
              ))}
            </div>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
            )}
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="block mb-2 text-sm text-gray-700 font-medium">
              Fecha límite <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Puedes seleccionar hoy o fechas futuras
            </p>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
            )}
          </div>

          {/* Mensaje de error general si ambos campos están vacíos */}
          {errors.priority && errors.dueDate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              Los campos Prioridad y Fecha límite son obligatorios.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} fullWidth>
            Guardar cambios
          </Button>
          <Button onClick={handleCancel} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
