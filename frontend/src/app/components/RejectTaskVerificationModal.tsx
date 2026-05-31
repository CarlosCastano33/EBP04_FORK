import { useState } from 'react';
import { AlertCircle, X, XCircle } from 'lucide-react';
import { Task } from '../types';
import { Button } from './Button';

interface RejectTaskVerificationModalProps {
  isOpen: boolean;
  task: Task | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectTaskVerificationModal({
  isOpen,
  task,
  onConfirm,
  onCancel,
}: RejectTaskVerificationModalProps) {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    setReason('');
    setError('');
    onCancel();
  };

  const handleBackToReject = () => {
    setShowCancelConfirmation(false);
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Debes proporcionar un motivo para rechazar la verificacion.');
      return;
    }

    setShowCancelConfirmation(false);
    setError('');
    onConfirm(reason.trim());
    setReason('');
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
        onClick={handleBackToReject}
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
              onClick={handleBackToReject}
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
            <Button onClick={handleBackToReject} fullWidth>
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Rechazar cumplimiento</h2>
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
            Estas seguro de que deseas rechazar esta tarea? El usuario responsable sera
            notificado.
          </p>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
            <h3 className="font-medium text-gray-800">{task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-700 font-medium">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              placeholder="Explica por que rechazas esta tarea..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleConfirm} variant="danger" fullWidth>
            Si, rechazar
          </Button>
          <Button onClick={handleCancelClick} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
