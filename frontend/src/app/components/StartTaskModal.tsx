import { useState } from 'react';
import { AlertCircle, Play, X } from 'lucide-react';
import { Task } from '../types';
import { Button } from './Button';

interface StartTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function StartTaskModal({ isOpen, task, onConfirm, onCancel }: StartTaskModalProps) {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  if (!isOpen || !task) return null;

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    onCancel();
  };

  const handleBackToStart = () => {
    setShowCancelConfirmation(false);
  };

  const handleConfirm = () => {
    setShowCancelConfirmation(false);
    onConfirm();
  };

  if (showCancelConfirmation) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={handleBackToStart}
      >
        <div
          className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn"
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Seguro que no quieres iniciar la tarea?
              </h2>
            </div>
            <button
              onClick={handleBackToStart}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Si cancelas ahora, la tarea permanecera en estado <strong>Aceptada</strong> y no
              se registrara ningun cambio.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirmCancel} variant="secondary" fullWidth>
              Si, cancelar
            </Button>
            <Button onClick={handleBackToStart} fullWidth>
              No, volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={handleCancelClick}
    >
      <div
        className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scaleIn"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Iniciar tarea</h2>
          </div>
          <button
            onClick={handleCancelClick}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Estas seguro de que deseas iniciar esta tarea? Una vez iniciada, quedara marcada
            como <strong>En progreso</strong>.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-gray-800">{task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleConfirm} fullWidth>
            Confirmar
          </Button>
          <Button onClick={handleCancelClick} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
