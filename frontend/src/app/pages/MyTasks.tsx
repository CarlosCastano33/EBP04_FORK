import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { AcceptTaskModal } from '../components/AcceptTaskModal';
import { RejectTaskModal } from '../components/RejectTaskModal';
import { ArrowLeft, CheckCircle, Calendar, User, Check, X, ClipboardList } from 'lucide-react';
import { Task, TaskPriority } from '../types';

export function MyTasks() {
  const { currentUser, getHomeTasks, acceptTask, rejectTask, getHomeMembers } = useAuth();
  const navigate = useNavigate();

  const [taskToAccept, setTaskToAccept] = useState<Task | null>(null);
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [acceptError, setAcceptError] = useState<string>('');
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [rejectError, setRejectError] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');
  const [refreshTasks, setRefreshTasks] = useState(0);

  // Obtener solo tareas asignadas al usuario actual
  const allTasks = getHomeTasks();
  const myTasks = allTasks.filter(task => task.assignedTo === currentUser?.id);

  // Filtrar por prioridad
  const filteredTasks = priorityFilter === 'Todas'
    ? myTasks
    : myTasks.filter(task => task.priority === priorityFilter);

  const handleAcceptTask = (task: Task) => {
    setTaskToAccept(task);
    setAcceptError('');
  };

  const handleConfirmAccept = async () => {
    if (taskToAccept) {
      try {
        await acceptTask(taskToAccept.id);
        setTaskToAccept(null);
        setAcceptSuccess(true);
        setAcceptError('');
        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setAcceptSuccess(false);
        }, 3000);
      } catch (error: any) {
        setAcceptError(error.message);
        setTaskToAccept(null);

        setTimeout(() => {
          setAcceptError('');
        }, 5000);
      }
    }
  };

  const handleCancelAccept = () => {
    setTaskToAccept(null);
    setAcceptError('');
  };

  const handleRejectTask = (task: Task) => {
    setTaskToReject(task);
    setRejectError('');
  };

  const handleConfirmReject = async (reason: string) => {
    if (taskToReject) {
      try {
        await rejectTask(taskToReject.id, reason);
        setTaskToReject(null);
        setRejectSuccess(true);
        setRejectError('');
        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setRejectSuccess(false);
        }, 3000);
      } catch (error: any) {
        setRejectError(error.message);
        setTaskToReject(null);

        setTimeout(() => {
          setRejectError('');
        }, 5000);
      }
    }
  };

  const handleCancelReject = () => {
    setTaskToReject(null);
    setRejectError('');
  };

  const getAssignedByName = (userId: string) => {
    const members = getHomeMembers();
    const user = members.find(m => m.id === userId);
    return user?.name || 'Usuario desconocido';
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${colors[priority]}`}>
        <span className="mr-1">{icons[priority]}</span>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 font-medium">
            🟡 Pendiente aceptación
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-300 font-medium">
            🟢 Aceptada
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-300 font-medium">
            🔴 Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>

        <Card title={`✅ Mis Tareas (${myTasks.length})`} maxWidth="max-w-4xl mx-auto">
          {acceptSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">
                Has aceptado la tarea correctamente.
              </span>
            </div>
          )}

          {acceptError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <span className="text-sm text-red-600">
                ⚠️ {acceptError}
              </span>
            </div>
          )}

          {rejectSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">
                Has rechazado la tarea.
              </span>
            </div>
          )}

          {rejectError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <span className="text-sm text-red-600">
                ⚠️ {rejectError}
              </span>
            </div>
          )}

          {/* Filtros de prioridad */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {['Todas', 'Alta', 'Media', 'Baja'].map((filter) => (
              <button
                key={filter}
                onClick={() => setPriorityFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  priorityFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'Alta' && '🔴 '}
                {filter === 'Media' && '🟡 '}
                {filter === 'Baja' && '🟢 '}
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {priorityFilter === 'Todas'
                    ? '📭 No tienes tareas asignadas'
                    : priorityFilter === 'Alta'
                    ? '🔴 No tienes tareas con prioridad Alta'
                    : priorityFilter === 'Media'
                    ? '🟡 No tienes tareas con prioridad Media'
                    : '🟢 No tienes tareas con prioridad Baja'}
                </p>
                <p className="text-sm text-gray-400">
                  Las tareas que te asignes o que te reasignen aparecerán aquí
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Nombre de la tarea */}
                      <h4 className="text-gray-800 font-medium mb-3 text-lg">
                        {task.name}
                      </h4>

                      {/* Descripción */}
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Prioridad y Fecha límite */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {task.priority && getPriorityBadge(task.priority)}

                        {task.dueDate && (
                          <span className="inline-flex items-center text-xs text-gray-700 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>

                      {/* Estado */}
                      <div className="mb-2">
                        {getStatusBadge(task.status)}
                      </div>

                      {/* Asignada por */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Asignada por: <strong>{getAssignedByName(task.createdBy)}</strong></span>
                      </div>
                    </div>

                    {/* Botones de acción solo si está pendiente */}
                    {task.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptTask(task)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRejectTask(task)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Modal de aceptar tarea */}
        <AcceptTaskModal
          isOpen={taskToAccept !== null}
          task={taskToAccept}
          onConfirm={handleConfirmAccept}
          onCancel={handleCancelAccept}
        />

        {/* Modal de rechazar tarea */}
        <RejectTaskModal
          isOpen={taskToReject !== null}
          task={taskToReject}
          onConfirm={handleConfirmReject}
          onCancel={handleCancelReject}
        />
      </div>
    </div>
  );
}
