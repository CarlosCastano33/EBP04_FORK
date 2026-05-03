import { useState } from 'react';
import { Task, User } from '../types';
import { Button } from './Button';
import { X, Calendar, CheckCircle } from 'lucide-react';

interface AssignTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  members: User[];
  onAssign: (userId: string) => void;
  onCancel: () => void;
  externalError?: string;
  currentUserId?: string;
}

export function AssignTaskModal({ isOpen, task, members, onAssign, onCancel, externalError, currentUserId }: AssignTaskModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !task) return null;

  const selectedUser = members.find(m => m.id === selectedUserId);

  // Determinar el rol real del usuario basado en isAdmin y role
  const getUserRole = (user: User): string => {
    // Si tiene rol asignado y es válido, usarlo
    if (user.role && ['Administrador', 'Miembro', 'Invitado'].includes(user.role)) {
      return user.role;
    }
    // Si es admin pero no tiene rol asignado
    if (user.isAdmin) {
      return 'Administrador';
    }
    // Por defecto es Miembro (no Invitado, ya que ese debe estar explícito)
    return 'Miembro';
  };

  const selectedUserRole = selectedUser ? getUserRole(selectedUser) : '';
  const isGuestSelected = selectedUserRole === 'Invitado';
  const displayError = externalError || error;

  const handleAssign = () => {
    setError('');

    if (!selectedUserId) {
      setError('Debe seleccionar un responsable.');
      return;
    }

    onAssign(selectedUserId);
  };

  const handleCancel = () => {
    setSelectedUserId('');
    setError('');
    onCancel();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrador':
        return '👑';
      case 'Miembro':
        return '👤';
      case 'Invitado':
        return '👀';
      default:
        return '👤';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'Administrador';
      case 'Miembro':
        return 'Miembro';
      case 'Invitado':
        return 'Invitado';
      default:
        return 'Miembro';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const colors = {
      Alta: 'bg-red-100 text-red-700 border-red-300',
      Media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Baja: 'bg-green-100 text-green-700 border-green-300',
    };

    const icons = {
      Alta: '🔴',
      Media: '🟡',
      Baja: '🟢',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${colors[priority as keyof typeof colors]}`}>
        <span className="mr-1">{icons[priority as keyof typeof icons]}</span>
        {priority}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 animate-scaleIn"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Asignar tarea</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Task Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">{task.name}</h3>

          <div className="space-y-2">
            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Prioridad:</span>
              {getPriorityBadge(task.priority)}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Fecha límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Select Responsible */}
        <div className="mb-6">
          <label className="block mb-2 text-sm text-gray-700 font-medium">
            Seleccionar responsable <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              displayError ? 'border-red-500' : isGuestSelected ? 'border-amber-400' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Selecciona un usuario</option>
            {members.map((member) => {
              const userRole = getUserRole(member);
              const isCurrentUser = member.id === currentUserId;
              return (
                <option
                  key={member.id}
                  value={member.id}
                  style={{
                    color: userRole === 'Invitado' ? '#9CA3AF' : 'inherit'
                  }}
                >
                  {getRoleIcon(userRole)} {member.name} - {getRoleLabel(userRole)}{userRole === 'Invitado' ? ' (No asignable)' : ''}{isCurrentUser ? ' (Tú)' : ''}
                </option>
              );
            })}
          </select>

          {/* Advertencia cuando se selecciona invitado */}
          {isGuestSelected && !displayError && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2">
              <span className="text-amber-600 text-sm">⚠️</span>
              <p className="text-sm text-amber-700">
                Los usuarios invitados no pueden recibir tareas.
              </p>
            </div>
          )}

          {/* Error de validación */}
          {displayError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <span className="text-red-600 text-sm">❌</span>
              <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          {members.length === 0 && (
            <p className="mt-2 text-sm text-gray-600">
              No hay miembros en el hogar.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleAssign} fullWidth disabled={members.length === 0}>
            Confirmar asignación
          </Button>
          <Button onClick={handleCancel} variant="secondary" fullWidth>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
