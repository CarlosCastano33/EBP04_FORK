import { useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Task } from '../types';
import { Button } from './Button';

interface VerifyTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VerifyTaskModal({ isOpen, task, onConfirm, onCancel }: VerifyTaskModalProps) {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  if (!isOpen || !task) return null;

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    onCancel();
  };

  const handleBackToVerify = () => {
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
        onClick={handleBackToVerify}
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
                Seguro que no deseas validar esta tarea ahora?
              </h2>
            </div>
            <button
              onClick={handleBackToVerify}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Si cancelas ahora, la tarea permanecera en estado{' '}
              <strong>Pendiente de verificacion</strong> hasta que la revises.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirmCancel} variant="secondary" fullWidth>
              Si, cancelar
            </Button>
            <Button onClick={handleBackToVerify} fullWidth>
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
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Confirmar cumplimiento</h2>
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
            Confirmas que esta tarea fue realizada correctamente? El usuario responsable sera
            notificado.
          </p>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-medium text-gray-800">{task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleConfirm} fullWidth>
            Si, confirmar
          </Button>
          <Button onClick={handleCancelClick} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
