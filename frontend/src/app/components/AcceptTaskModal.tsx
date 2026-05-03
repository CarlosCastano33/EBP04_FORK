import { Task } from '../types';
import { Button } from './Button';
import { X, CheckCircle } from 'lucide-react';

interface AcceptTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AcceptTaskModal({ isOpen, task, onConfirm, onCancel }: AcceptTaskModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Aceptar tarea</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            ¿Deseas aceptar esta tarea?
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800">{task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={onConfirm} fullWidth>
            Confirmar aceptación
          </Button>
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
