import { useState } from 'react';
import { Task } from '../types';
import { Button } from './Button';
import { X, XCircle } from 'lucide-react';

interface RejectTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectTaskModal({ isOpen, task, onConfirm, onCancel }: RejectTaskModalProps) {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    setError('');

    if (!reason.trim()) {
      setError('El motivo del rechazo es obligatorio.');
      return;
    }

    onConfirm(reason);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={handleCancel}
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Rechazar tarea</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            ¿Deseas rechazar esta tarea?
          </p>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h3 className="font-medium text-gray-800">{task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block mb-2 text-sm text-gray-700 font-medium">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: No estoy disponible, No puedo realizarla hoy, etc."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleConfirm} variant="danger" fullWidth>
            Confirmar rechazo
          </Button>
          <Button onClick={handleCancel} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
