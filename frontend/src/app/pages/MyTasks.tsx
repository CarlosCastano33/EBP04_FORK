import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { AcceptTaskModal } from '../components/AcceptTaskModal';
import { RejectTaskModal } from '../components/RejectTaskModal';
import { StartTaskModal } from '../components/StartTaskModal';
import { CompleteTaskModal } from '../components/CompleteTaskModal';
import { ArrowLeft, Calendar, Check, CheckCircle, ClipboardList, Play, User, X } from 'lucide-react';
import { Task, TaskPriority } from '../types';

export function MyTasks() {
  const {
    currentUser,
    getHomeTasks,
    acceptTask,
    rejectTask,
    startTask,
    completeTask,
    getHomeMembers,
  } = useAuth();
  const navigate = useNavigate();

  const [taskToAccept, setTaskToAccept] = useState<Task | null>(null);
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [taskToStart, setTaskToStart] = useState<Task | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [acceptError, setAcceptError] = useState<string>('');
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [rejectError, setRejectError] = useState<string>('');
  const [startSuccess, setStartSuccess] = useState(false);
  const [startError, setStartError] = useState<string>('');
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [completeError, setCompleteError] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');

  const allTasks = getHomeTasks();
  const myTasks = allTasks.filter(
    (task) => task.assignedTo === currentUser?.id && task.status !== 'verified',
  );

  const filteredTasks =
    priorityFilter === 'Todas'
      ? myTasks
      : myTasks.filter((task) => task.priority === priorityFilter);

  const showTemporarySuccess = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 3000);
  };

  const showTemporaryError = (
    error: unknown,
    setter: (value: string) => void,
  ) => {
    setter(error instanceof Error ? error.message : 'Ocurrio un error al procesar la tarea.');
    setTimeout(() => setter(''), 5000);
  };

  const handleAcceptTask = (task: Task) => {
    setTaskToAccept(task);
    setAcceptError('');
  };

  const handleConfirmAccept = async () => {
    if (!taskToAccept) return;

    try {
      await acceptTask(taskToAccept.id);
      setTaskToAccept(null);
      setAcceptError('');
      showTemporarySuccess(setAcceptSuccess);
    } catch (error) {
      setTaskToAccept(null);
      showTemporaryError(error, setAcceptError);
    }
  };

  const handleRejectTask = (task: Task) => {
    setTaskToReject(task);
    setRejectError('');
  };

  const handleConfirmReject = async (reason: string) => {
    if (!taskToReject) return;

    try {
      await rejectTask(taskToReject.id, reason);
      setTaskToReject(null);
      setRejectError('');
      showTemporarySuccess(setRejectSuccess);
    } catch (error) {
      setTaskToReject(null);
      showTemporaryError(error, setRejectError);
    }
  };

  const handleStartTask = (task: Task) => {
    setTaskToStart(task);
    setStartError('');
  };

  const handleConfirmStart = async () => {
    if (!taskToStart) return;

    try {
      await startTask(taskToStart.id);
      setTaskToStart(null);
      setStartError('');
      showTemporarySuccess(setStartSuccess);
    } catch (error) {
      setTaskToStart(null);
      showTemporaryError(error, setStartError);
    }
  };

  const handleCompleteTask = (task: Task) => {
    setTaskToComplete(task);
    setCompleteError('');
  };

  const handleConfirmComplete = async () => {
    if (!taskToComplete) return;

    try {
      await completeTask(taskToComplete.id);
      setTaskToComplete(null);
      setCompleteError('');
      showTemporarySuccess(setCompleteSuccess);
    } catch (error) {
      setTaskToComplete(null);
      showTemporaryError(error, setCompleteError);
    }
  };

  const getMemberName = (userId?: string) => {
    if (!userId) return 'Usuario desconocido';

    const user = getHomeMembers().find((member) => member.id === userId);
    return user?.name || 'Usuario desconocido';
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
    if (!priority) return null;

    const colors = {
      Alta: 'bg-red-100 text-red-700 border-red-300',
      Media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Baja: 'bg-green-100 text-green-700 border-green-300',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300|Pendiente aceptacion',
      accepted: 'bg-green-100 text-green-700 border-green-300|Aceptada',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-300|En progreso',
      completed: 'bg-purple-100 text-purple-700 border-purple-300|Completada - Pendiente de verificacion',
      verification_rejected: 'bg-orange-100 text-orange-700 border-orange-300|Verificacion rechazada',
      rejected: 'bg-red-100 text-red-700 border-red-300|Rechazada',
      verified: 'bg-teal-100 text-teal-700 border-teal-300|Verificada',
    };

    if (!status || !badges[status]) return null;

    const [classes, label] = badges[status].split('|');
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border font-medium ${classes}`}>
        {label}
      </span>
    );
  };

  const renderNotice = (
    visible: boolean,
    tone: 'green' | 'blue' | 'purple' | 'red',
    message: string,
  ) => {
    if (!visible) return null;

    const styles = {
      green: 'bg-green-50 border-green-200 text-green-600',
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      red: 'bg-red-50 border-red-200 text-red-600',
    };

    return (
      <div className={`mb-4 p-3 border rounded-lg flex items-center gap-2 ${styles[tone]}`}>
        {tone !== 'red' && <CheckCircle className="w-5 h-5" />}
        <span className="text-sm">{message}</span>
      </div>
    );
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

        <Card title={`Mis Tareas (${myTasks.length})`} maxWidth="max-w-4xl mx-auto">
          {renderNotice(acceptSuccess, 'green', 'Has aceptado la tarea correctamente.')}
          {renderNotice(Boolean(acceptError), 'red', acceptError)}
          {renderNotice(rejectSuccess, 'green', 'Has rechazado la tarea.')}
          {renderNotice(Boolean(rejectError), 'red', rejectError)}
          {renderNotice(startSuccess, 'blue', 'Tarea iniciada correctamente.')}
          {renderNotice(Boolean(startError), 'red', startError)}
          {renderNotice(
            completeSuccess,
            'purple',
            'Tarea marcada como completada. Queda pendiente de verificacion.',
          )}
          {renderNotice(Boolean(completeError), 'red', completeError)}

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
                    ? 'No tienes tareas asignadas'
                    : `No tienes tareas con prioridad ${priorityFilter}`}
                </p>
                <p className="text-sm text-gray-400">
                  Las tareas que te asignen apareceran aqui.
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
                      <h4 className="text-gray-800 font-medium mb-3 text-lg">{task.name}</h4>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {task.priority && getPriorityBadge(task.priority)}

                        {task.dueDate && (
                          <span className="inline-flex items-center text-xs text-gray-700 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {new Date(task.dueDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>

                      <div className="mb-2">{getStatusBadge(task.status)}</div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          Asignada por: <strong>{getMemberName(task.createdBy)}</strong>
                        </span>
                      </div>

                      {task.status === 'in_progress' && task.startedAt && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium">
                            Iniciada el {new Date(task.startedAt).toLocaleDateString('es-ES')} a las{' '}
                            {new Date(task.startedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}

                      {task.status === 'completed' && task.completedAt && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-xs text-purple-700 font-medium">
                            Completada el {new Date(task.completedAt).toLocaleDateString('es-ES')} a las{' '}
                            {new Date(task.completedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Esperando verificacion del administrador.
                          </p>
                        </div>
                      )}

                      {task.status === 'verification_rejected' && task.verificationRejectionReason && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-700 font-medium mb-1">
                            El administrador rechazo la verificacion de esta tarea.
                          </p>
                          <p className="text-xs text-orange-700 font-medium mb-1">Motivo:</p>
                          <p className="text-xs text-orange-600">
                            {task.verificationRejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

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

                    {(task.status === 'accepted' || task.status === 'verification_rejected') && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleStartTask(task)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Iniciar
                        </button>
                      </div>
                    )}

                    {task.status === 'in_progress' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCompleteTask(task)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Completar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <AcceptTaskModal
          isOpen={taskToAccept !== null}
          task={taskToAccept}
          onConfirm={handleConfirmAccept}
          onCancel={() => {
            setTaskToAccept(null);
            setAcceptError('');
          }}
        />

        <RejectTaskModal
          isOpen={taskToReject !== null}
          task={taskToReject}
          onConfirm={handleConfirmReject}
          onCancel={() => {
            setTaskToReject(null);
            setRejectError('');
          }}
        />

        <StartTaskModal
          isOpen={taskToStart !== null}
          task={taskToStart}
          onConfirm={handleConfirmStart}
          onCancel={() => {
            setTaskToStart(null);
            setStartError('');
          }}
        />

        <CompleteTaskModal
          isOpen={taskToComplete !== null}
          task={taskToComplete}
          onConfirm={handleConfirmComplete}
          onCancel={() => {
            setTaskToComplete(null);
            setCompleteError('');
          }}
        />
      </div>
    </div>
  );
}
