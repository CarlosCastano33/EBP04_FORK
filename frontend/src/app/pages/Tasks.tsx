import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { AssignTaskModal } from '../components/AssignTaskModal';
import { AcceptTaskModal } from '../components/AcceptTaskModal';
import { RejectTaskModal } from '../components/RejectTaskModal';
import { ReassignTaskModal } from '../components/ReassignTaskModal';
import { VerifyTaskModal } from '../components/VerifyTaskModal';
import { RejectTaskVerificationModal } from '../components/RejectTaskVerificationModal';
import { StartTaskModal } from '../components/StartTaskModal';
import { CompleteTaskModal } from '../components/CompleteTaskModal';
import { ArrowLeft, CheckCircle, ClipboardList, Shield, Trash2, Edit, Calendar, UserPlus, User, Check, X, RefreshCw, XCircle, Play } from 'lucide-react';
import { Task, TaskPriority } from '../types';

export function Tasks() {
  const { currentUser, createTask, getHomeTasks, deleteTask, updateTask, assignTask, acceptTask, rejectTask, reassignTask, startTask, completeTask, verifyTask, rejectTaskVerification, getHomeMembers } = useAuth();
  const navigate = useNavigate();

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignError, setAssignError] = useState<string>('');
  const [assignModalError, setAssignModalError] = useState<string>('');
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [acceptError, setAcceptError] = useState<string>('');
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [rejectError, setRejectError] = useState<string>('');
  const [reassignSuccess, setReassignSuccess] = useState(false);
  const [reassignError, setReassignError] = useState<string>('');
  const [reassignModalError, setReassignModalError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
  const [taskToAccept, setTaskToAccept] = useState<Task | null>(null);
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [taskToReassign, setTaskToReassign] = useState<Task | null>(null);
  const [taskToVerify, setTaskToVerify] = useState<Task | null>(null);
  const [taskToRejectVerification, setTaskToRejectVerification] = useState<Task | null>(null);
  const [taskToStart, setTaskToStart] = useState<Task | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [startSuccess, setStartSuccess] = useState(false);
  const [startError, setStartError] = useState<string>('');
  const [completeSuccess, setCompleteSuccess] = useState(false);
  const [completeError, setCompleteError] = useState<string>('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifySuccessType, setVerifySuccessType] = useState<'verify' | 'reject'>('verify');
  const [verifyError, setVerifyError] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');
  const [tabFilter, setTabFilter] = useState<'Todas' | 'Pendientes por asignar' | 'Pendientes de verificacion'>('Todas');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);

  // Forzar actualización de tareas cuando cambia refreshTasks
  const allTasks = getHomeTasks().filter(task => task.status !== 'verified');

  // Check user role and permissions
  const isAdmin = currentUser?.isAdmin;
  const isMember = currentUser?.role === 'Miembro';
  const isGuest = currentUser?.role === 'Invitado';
  const canCreateTasks = isAdmin;
  const canEditTasks = isAdmin;
  const canAssignTasks = isAdmin;

  // Filtrar tareas para miembros: solo ver sus propias tareas y tareas sin asignar
  const displayTasks = isMember
    ? allTasks.filter(task => !task.assignedTo || task.assignedTo === currentUser?.id || task.createdBy === currentUser?.id)
    : allTasks;

  // Para administradores: filtrar por pestaña
  const tabFilteredTasks = isAdmin
    ? tabFilter === 'Pendientes por asignar'
      ? displayTasks.filter(task => {
          const status = task.status || (task.assignedTo ? 'pending' : 'unassigned');
          return status === 'unassigned' || status === 'rejected';
        })
      : tabFilter === 'Pendientes de verificacion'
      ? displayTasks.filter(task => task.status === 'completed')
      : displayTasks
    : displayTasks;

  // Calcular contador de pendientes por asignar (solo para admins)
  const pendingToAssignCount = isAdmin
    ? displayTasks.filter(task => {
        const status = task.status || (task.assignedTo ? 'pending' : 'unassigned');
        return status === 'unassigned' || status === 'rejected';
      }).length
    : 0;

  const pendingVerificationCount = isAdmin
    ? displayTasks.filter(task => task.status === 'completed').length
    : 0;

  // Filtrar por prioridad
  const tasks = priorityFilter === 'Todas'
    ? tabFilteredTasks
    : tabFilteredTasks.filter(task => task.priority === priorityFilter);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showPriorityDropdown && !target.closest('.priority-dropdown-container')) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPriorityDropdown]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Obtener fecha actual sin horas
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!taskName.trim()) {
      newErrors.taskName = 'El nombre de la tarea es obligatorio.';
    }

    if (!taskPriority) {
      newErrors.taskPriority = 'Debe seleccionar una prioridad.';
    }

    if (!taskDueDate) {
      newErrors.taskDueDate = 'Debe seleccionar una fecha límite.';
    } else {
      // Convertir string YYYY-MM-DD a fecha local
      const [year, month, day] = taskDueDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);

      // Comparar solo fechas (sin horas)
      if (selectedDate < todayDateOnly) {
        newErrors.taskDueDate = 'La fecha límite no puede ser anterior a la fecha actual.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async () => {
    setSuccess(false);

    if (!validate()) return;

    // Convertir fecha a timestamp en zona horaria local
    const [year, month, day] = taskDueDate.split('-').map(Number);
    const dueDateLocal = new Date(year, month - 1, day, 12, 0, 0);
    const dueDateTimestamp = dueDateLocal.getTime();

    try {
      await createTask(taskName, taskPriority as TaskPriority, dueDateTimestamp, taskDescription);
      setSuccess(true);
      setTaskName('');
      setTaskDescription('');
      setTaskPriority('');
      setTaskDueDate('');
    } catch (error: any) {
      setErrors({ taskName: error.message });
      return;
    }

    // Forzar actualización de la lista de tareas
    setRefreshTasks(prev => prev + 1);

    // Ocultar formulario y mensaje de éxito después de 3 segundos
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
    }, 3000);
  };

  const handleCancel = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskPriority('');
    setTaskDueDate('');
    setErrors({});
    setShowForm(false);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setTaskToDelete(null);
        setShowCancelConfirmation(false);
        setDeleteSuccess(true);
      } catch (error: any) {
        setErrors({ taskName: error.message });
        setTaskToDelete(null);
        setShowCancelConfirmation(false);
        return;
      }

      // Forzar actualización de la lista de tareas
      setRefreshTasks(prev => prev + 1);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    }
  };

  const handleCancelDelete = () => {
    // Mostrar segundo modal de confirmación de cancelación
    setShowCancelConfirmation(true);
  };

  const handleConfirmKeepTask = () => {
    // Usuario confirma que quiere conservar la tarea
    setTaskToDelete(null);
    setShowCancelConfirmation(false);
  };

  const handleBackToDelete = () => {
    // Usuario quiere volver al primer modal
    setShowCancelConfirmation(false);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleSaveEdit = async (priority: TaskPriority, dueDate: number) => {
    if (taskToEdit) {
      try {
        await updateTask(taskToEdit.id, { priority, dueDate });
        setTaskToEdit(null);
        setEditSuccess(true);
      } catch (error: any) {
        setErrors({ taskName: error.message });
        setTaskToEdit(null);
        return;
      }

      // Forzar actualización de la lista de tareas
      setRefreshTasks(prev => prev + 1);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setEditSuccess(false);
      }, 3000);
    }
  };

  const handleCancelEdit = () => {
    setTaskToEdit(null);
  };

  const handleAssignTask = (task: Task) => {
    setTaskToAssign(task);
    setAssignError('');
    setAssignModalError('');
  };

  const handleConfirmAssign = async (userId: string) => {
    if (taskToAssign) {
      try {
        await assignTask(taskToAssign.id, userId);
        setTaskToAssign(null);
        setAssignSuccess(true);
        setAssignError('');
        setAssignModalError('');

        // Forzar actualización de la lista de tareas
        setRefreshTasks(prev => prev + 1);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setAssignSuccess(false);
        }, 3000);
      } catch (error: any) {
        // Mostrar error dentro del modal
        setAssignModalError(error.message);
        // NO cerrar el modal para que el usuario vea el error
      }
    }
  };

  const handleCancelAssign = () => {
    setTaskToAssign(null);
    setAssignError('');
    setAssignModalError('');
  };

  const getAssignedUserName = (userId?: string) => {
    if (!userId) return null;

    const members = getHomeMembers();
    const user = members.find(m => m.id === userId);
    return user?.name || 'Usuario desconocido';
  };

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

        // Forzar actualización de la lista de tareas
        setRefreshTasks(prev => prev + 1);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setAcceptSuccess(false);
        }, 3000);
      } catch (error: any) {
        setAcceptError(error.message);
        setTaskToAccept(null);

        // Ocultar mensaje de error después de 5 segundos
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

        // Forzar actualización de la lista de tareas
        setRefreshTasks(prev => prev + 1);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setRejectSuccess(false);
        }, 3000);
      } catch (error: any) {
        setRejectError(error.message);
        setTaskToReject(null);

        // Ocultar mensaje de error después de 5 segundos
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

  const handleStartTask = (task: Task) => {
    setTaskToStart(task);
    setStartError('');
  };

  const handleConfirmStart = async () => {
    if (taskToStart) {
      try {
        await startTask(taskToStart.id);
        setTaskToStart(null);
        setStartSuccess(true);
        setStartError('');

        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setStartSuccess(false);
        }, 3000);
      } catch (error: any) {
        setStartError(error.message);
        setTaskToStart(null);

        setTimeout(() => {
          setStartError('');
        }, 5000);
      }
    }
  };

  const handleCancelStart = () => {
    setTaskToStart(null);
    setStartError('');
  };

  const handleCompleteTask = (task: Task) => {
    setTaskToComplete(task);
    setCompleteError('');
  };

  const handleConfirmComplete = async () => {
    if (taskToComplete) {
      try {
        await completeTask(taskToComplete.id);
        setTaskToComplete(null);
        setCompleteSuccess(true);
        setCompleteError('');

        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setCompleteSuccess(false);
        }, 3000);
      } catch (error: any) {
        setCompleteError(error.message);
        setTaskToComplete(null);

        setTimeout(() => {
          setCompleteError('');
        }, 5000);
      }
    }
  };

  const handleCancelComplete = () => {
    setTaskToComplete(null);
    setCompleteError('');
  };

  const handleReassignTask = (task: Task) => {
    setTaskToReassign(task);
    setReassignError('');
    setReassignModalError('');
  };

  const handleConfirmReassign = async (userId: string | null) => {
    if (taskToReassign) {
      try {
        await reassignTask(taskToReassign.id, userId);
        setTaskToReassign(null);
        setReassignSuccess(true);
        setReassignError('');
        setReassignModalError('');

        // Forzar actualización de la lista de tareas
        setRefreshTasks(prev => prev + 1);

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setReassignSuccess(false);
        }, 3000);
      } catch (error: any) {
        // Mostrar error dentro del modal
        setReassignModalError(error.message);
        // NO cerrar el modal para que el usuario vea el error
      }
    }
  };

  const handleCancelReassign = () => {
    setTaskToReassign(null);
    setReassignError('');
    setReassignModalError('');
  };

  const handleVerifyTask = (task: Task) => {
    setTaskToVerify(task);
    setVerifyError('');
  };

  const handleConfirmVerify = async () => {
    if (taskToVerify) {
      try {
        await verifyTask(taskToVerify.id);
        setTaskToVerify(null);
        setVerifySuccess(true);
        setVerifySuccessType('verify');
        setVerifyError('');

        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setVerifySuccess(false);
        }, 3000);
      } catch (error: any) {
        setVerifyError(error.message);
        setTaskToVerify(null);

        setTimeout(() => {
          setVerifyError('');
        }, 5000);
      }
    }
  };

  const handleCancelVerify = () => {
    setTaskToVerify(null);
    setVerifyError('');
  };

  const handleRejectVerification = (task: Task) => {
    setTaskToRejectVerification(task);
    setVerifyError('');
  };

  const handleConfirmRejectVerification = async (reason: string) => {
    if (taskToRejectVerification) {
      try {
        await rejectTaskVerification(taskToRejectVerification.id, reason);
        setTaskToRejectVerification(null);
        setVerifySuccess(true);
        setVerifySuccessType('reject');
        setVerifyError('');

        setRefreshTasks(prev => prev + 1);

        setTimeout(() => {
          setVerifySuccess(false);
        }, 3000);
      } catch (error: any) {
        setVerifyError(error.message);
        setTaskToRejectVerification(null);

        setTimeout(() => {
          setVerifyError('');
        }, 5000);
      }
    }
  };

  const handleCancelRejectVerification = () => {
    setTaskToRejectVerification(null);
    setVerifyError('');
  };

  const getCurrentResponsible = (task: Task) => {
    if (!task.assignedTo) return null;
    const members = getHomeMembers();
    return members.find(m => m.id === task.assignedTo) || null;
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

  const getPriorityChipColor = (pri: string) => {
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

  const getStatusBadge = (task: Task) => {
    const status = task.status || (task.assignedTo ? 'pending' : 'unassigned');

    switch (status) {
      case 'unassigned':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-300 font-medium">
            ⚪ Sin asignar
          </span>
        );
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
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-300 font-medium">
            En progreso
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-300 font-medium">
            Completada - Pendiente de verificacion
          </span>
        );
      case 'verification_rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-300 font-medium">
            Verificacion rechazada
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

  const getDueDateBadge = (dueDate?: number) => {
    if (!dueDate) return null;

    // Obtener fecha actual sin horas
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Obtener fecha límite sin horas
    const dueDateTime = new Date(dueDate);
    const dueDateOnly = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());

    // Calcular diferencia en días
    const diffTime = dueDateOnly.getTime() - todayDateOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Vencida (fecha pasada)
    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-300 font-medium">
          ⚠️ Vencida
        </span>
      );
    }

    // Vence hoy (mismo día)
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-300 font-medium">
          📌 Vence hoy
        </span>
      );
    }

    // Vence mañana
    if (diffDays === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 font-medium">
          🟡 Vence mañana
        </span>
      );
    }

    // Próxima a vencer (2-3 días)
    if (diffDays === 2 || diffDays === 3) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-300 font-medium">
          ⏰ Próxima a vencer
        </span>
      );
    }

    // Fechas futuras (más de 3 días) no muestran badge especial
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className={`container mx-auto py-8 ${isGuest ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>

        <div className={isGuest ? '' : 'grid md:grid-cols-2 gap-6'}>
          {/* Panel de creación de tareas */}
          {canCreateTasks && (
            <Card title={isMember ? "Crear Tarea Propia" : "Crear Tarea"} maxWidth="max-w-full">
              {!showForm ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {isMember
                      ? "Crea tareas propias que se asignarán automáticamente a ti"
                      : "Crea nuevas tareas domésticas para tu hogar"}
                  </p>
                  <Button onClick={() => setShowForm(true)} fullWidth>
                    {isMember ? "Crear mi tarea" : "Nueva tarea doméstica"}
                  </Button>
                </div>
              ) : (
              <div className="space-y-4">
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">
                      Tarea creada correctamente.
                    </span>
                  </div>
                )}

                {/* Nombre de la tarea */}
                <Input
                  label="Nombre de la tarea"
                  value={taskName}
                  onChange={setTaskName}
                  error={errors.taskName}
                  placeholder="Ej: Limpiar la cocina"
                  required
                />

                {/* Descripción */}
                <div className="w-full">
                  <label className="block mb-2 text-sm text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Descripción detallada de la tarea (opcional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block mb-2 text-sm text-gray-700 font-medium">
                    Prioridad <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Alta', 'Media', 'Baja'].map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setTaskPriority(pri)}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                          taskPriority === pri
                            ? getPriorityChipColor(pri)
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-base mr-1">
                          {pri === 'Alta' ? '🔴' : pri === 'Media' ? '🟡' : '🟢'}
                        </span>
                        {pri}
                      </button>
                    ))}
                  </div>
                  {errors.taskPriority && (
                    <p className="mt-1 text-sm text-red-500">{errors.taskPriority}</p>
                  )}
                </div>

                {/* Fecha límite */}
                <div>
                  <label className="block mb-2 text-sm text-gray-700 font-medium">
                    Fecha límite <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.taskDueDate ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Puedes seleccionar hoy o fechas futuras
                  </p>
                  {errors.taskDueDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.taskDueDate}</p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateTask} fullWidth>
                    Crear tarea
                  </Button>
                  <Button onClick={handleCancel} variant="secondary" fullWidth>
                    Cancelar
                  </Button>
                </div>
              </div>
              )}
            </Card>
          )}

          {/* Lista de tareas */}
          <Card
            title="Tareas del Hogar"
            maxWidth={isGuest ? "max-w-full" : canCreateTasks ? "max-w-full" : "max-w-3xl mx-auto"}
          >
            {deleteSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">
                  Tarea eliminada correctamente.
                </span>
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">
                  Tarea actualizada correctamente.
                </span>
              </div>
            )}

            {assignSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">
                  Tarea asignada correctamente.
                </span>
              </div>
            )}

            {assignError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-600">
                  ⚠️ {assignError}
                </span>
              </div>
            )}

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

            {startSuccess && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600">
                  Tarea iniciada correctamente.
                </span>
              </div>
            )}

            {startError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-600">
                  {startError}
                </span>
              </div>
            )}

            {completeSuccess && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600">
                  Tarea marcada como completada. Queda pendiente de verificacion.
                </span>
              </div>
            )}

            {completeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-600">
                  {completeError}
                </span>
              </div>
            )}

            {reassignSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600">
                  Tarea reasignada correctamente.
                </span>
              </div>
            )}

            {reassignError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-600">
                  ⚠️ {reassignError}
                </span>
              </div>
            )}

            {verifySuccess && (
              <div className={`mb-4 p-3 border rounded-lg flex items-center gap-2 ${
                verifySuccessType === 'verify'
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <CheckCircle className={`w-5 h-5 ${
                  verifySuccessType === 'verify' ? 'text-teal-600' : 'text-orange-600'
                }`} />
                <span className={`text-sm ${
                  verifySuccessType === 'verify' ? 'text-teal-600' : 'text-orange-600'
                }`}>
                  {verifySuccessType === 'verify'
                    ? 'Tarea verificada correctamente.'
                    : 'Verificacion rechazada correctamente.'}
                </span>
              </div>
            )}

            {verifyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-600">
                  {verifyError}
                </span>
              </div>
            )}

            {/* Filtros para administradores */}
            {isAdmin ? (
              <div className="mb-4">
                {/* Contenedor para pestañas y dropdown */}
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  {/* Pestañas de navegación */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTabFilter('Todas')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tabFilter === 'Todas'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setTabFilter('Pendientes por asignar')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tabFilter === 'Pendientes por asignar'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Pendientes por asignar {pendingToAssignCount > 0 && (
                        <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
                          tabFilter === 'Pendientes por asignar'
                            ? 'bg-white/20 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {pendingToAssignCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setTabFilter('Pendientes de verificacion')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tabFilter === 'Pendientes de verificacion'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Pendientes de verificacion {pendingVerificationCount > 0 && (
                        <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
                          tabFilter === 'Pendientes de verificacion'
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-500 text-white'
                        }`}>
                          {pendingVerificationCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Dropdown de prioridad */}
                  <div className="relative priority-dropdown-container">
                    <button
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-all flex items-center gap-2"
                    >
                      Prioridad: {priorityFilter}
                      <span className={`transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {/* Menú dropdown */}
                    {showPriorityDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        {['Todas', 'Alta', 'Media', 'Baja'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => {
                              setPriorityFilter(filter);
                              setShowPriorityDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                              priorityFilter === filter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {filter === 'Alta' && '🔴'}
                            {filter === 'Media' && '🟡'}
                            {filter === 'Baja' && '🟢'}
                            {filter}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Filtros para miembros e invitados con diseño consistente */
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
            )}

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {isAdmin && tabFilter === 'Pendientes por asignar'
                      ? priorityFilter === 'Todas'
                        ? '🎉 No hay tareas pendientes por asignar'
                        : priorityFilter === 'Alta'
                        ? '🔴 No hay tareas pendientes por asignar con prioridad Alta'
                        : priorityFilter === 'Media'
                        ? '🟡 No hay tareas pendientes por asignar con prioridad Media'
                        : '🟢 No hay tareas pendientes por asignar con prioridad Baja'
                      : priorityFilter === 'Todas'
                      ? '📭 No hay tareas creadas aún'
                      : priorityFilter === 'Alta'
                      ? '🔴 No hay tareas con prioridad Alta'
                      : priorityFilter === 'Media'
                      ? '🟡 No hay tareas con prioridad Media'
                      : '🟢 No hay tareas con prioridad Baja'}
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                      isGuest ? 'bg-white border border-gray-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Nombre de la tarea */}
                        <h4 className={`text-gray-800 font-medium mb-3 ${isGuest ? 'text-lg' : ''}`}>
                          {task.name}
                        </h4>

                        {/* Descripción */}
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {task.description}
                          </p>
                        )}

                        {/* Para invitados: layout optimizado en una sola línea */}
                        {isGuest ? (
                          <div className="space-y-3">
                            {/* Línea 1: Prioridad, Fecha límite y Badge de urgencia */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {task.priority && getPriorityBadge(task.priority)}

                              {task.dueDate && (
                                <span className="inline-flex items-center text-sm text-gray-700 whitespace-nowrap">
                                  <Calendar className="w-4 h-4 mr-1.5" />
                                  {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                </span>
                              )}

                              {getDueDateBadge(task.dueDate)}
                            </div>

                            {/* Línea 2: Estado, Responsable y Fecha de creación */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {getStatusBadge(task)}

                              {task.assignedTo && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-300 whitespace-nowrap">
                                  <User className="w-3.5 h-3.5 mr-1.5" />
                                  {getAssignedUserName(task.assignedTo)}
                                </span>
                              )}

                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>

                            {/* Información de rechazo si aplica */}
                            {task.status === 'rejected' && task.rejectionReason && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs font-medium text-red-700 mb-1">
                                  Rechazada por {getAssignedUserName(task.assignedTo)}
                                </p>
                                <p className="text-xs text-red-600">
                                  Motivo: {task.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Layout normal para admin/miembro */}
                            {/* Línea horizontal: Prioridad, Fecha límite y Badge de urgencia */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {task.priority && getPriorityBadge(task.priority)}

                              {task.dueDate && (
                                <span className="inline-flex items-center text-xs text-gray-700 whitespace-nowrap">
                                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                  {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                </span>
                              )}

                              {/* Badge especial de urgencia */}
                              {getDueDateBadge(task.dueDate)}
                            </div>

                            {/* Estado de la tarea */}
                            <div className="mb-2">
                              {getStatusBadge(task)}
                            </div>

                            {/* Responsable asignado y fecha de creación en línea horizontal */}
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              {task.assignedTo && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-300 whitespace-nowrap">
                                  <User className="w-3.5 h-3.5 mr-1.5" />
                                  Asignado a: {getAssignedUserName(task.assignedTo)}
                                </span>
                              )}

                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>

                            {/* Información de rechazo si aplica */}
                            {task.status === 'rejected' && task.rejectionReason && (
                              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                {isAdmin && tabFilter === 'Pendientes por asignar' ? (
                                  <>
                                    <p className="text-xs font-medium text-red-700 mb-1">
                                      🔴 Rechazada por {getAssignedUserName(task.assignedTo)}
                                    </p>
                                    <p className="text-xs text-red-600 mb-2">
                                      Motivo: {task.rejectionReason}
                                    </p>
                                    <p className="text-xs text-red-700 font-medium">
                                      Disponible para reasignar
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-xs font-medium text-red-700 mb-1">Motivo del rechazo:</p>
                                    <p className="text-xs text-red-600">{task.rejectionReason}</p>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Botones de acción */}
                      {!isGuest && (
                        <div className="flex gap-1 flex-shrink-0">
                          {/* Botones para el usuario asignado */}
                          {task.assignedTo === currentUser?.id && task.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptTask(task)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Aceptar tarea"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectTask(task)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Rechazar tarea"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}

                          {task.assignedTo === currentUser?.id && (task.status === 'accepted' || task.status === 'verification_rejected') && (
                            <button
                              onClick={() => handleStartTask(task)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Iniciar tarea"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          )}

                          {task.assignedTo === currentUser?.id && task.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteTask(task)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Completar tarea"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}

                          {/* Botones de verificacion para administradores */}
                          {canEditTasks && task.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleVerifyTask(task)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Confirmar cumplimiento"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectVerification(task)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Rechazar cumplimiento"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}

                          {/* Botones para administradores */}
                          {canAssignTasks && (task.status === 'unassigned' || task.status === 'rejected' || !task.status) && (
                            <button
                              onClick={() => handleAssignTask(task)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Asignar tarea"
                            >
                              <UserPlus className="w-5 h-5" />
                            </button>
                          )}
                          {canAssignTasks && task.assignedTo && task.status !== 'completed' && task.status !== 'verified' && task.status !== 'verification_rejected' && (
                            <button
                              onClick={() => handleReassignTask(task)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Reasignar tarea"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          )}
                          {canEditTasks && task.status !== 'completed' && task.status !== 'verified' && (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar tarea"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {canEditTasks && task.status !== 'completed' && task.status !== 'verified' && (
                            <button
                              onClick={() => setTaskToDelete(task.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Modal de confirmación de eliminación */}
        <ConfirmModal
          isOpen={taskToDelete !== null && !showCancelConfirmation}
          title="¿Estás seguro de eliminar esta tarea?"
          message="Esta acción eliminará permanentemente la tarea de la lista."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />

        {/* Modal de confirmación de cancelación */}
        <ConfirmModal
          isOpen={showCancelConfirmation}
          title="¿Deseas cancelar la eliminación de esta tarea?"
          message="La tarea se conservará en la lista si cancelas."
          onConfirm={handleConfirmKeepTask}
          onCancel={handleBackToDelete}
          confirmText="Sí, conservar tarea"
          cancelText="No, volver"
        />

        {/* Modal de edición de tarea */}
        <EditTaskModal
          isOpen={taskToEdit !== null}
          task={taskToEdit}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />

        {/* Modal de asignación de tarea */}
        <AssignTaskModal
          isOpen={taskToAssign !== null}
          task={taskToAssign}
          members={getHomeMembers()}
          onAssign={handleConfirmAssign}
          onCancel={handleCancelAssign}
          externalError={assignModalError}
          currentUserId={currentUser?.id}
        />

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

        <StartTaskModal
          isOpen={taskToStart !== null}
          task={taskToStart}
          onConfirm={handleConfirmStart}
          onCancel={handleCancelStart}
        />

        <CompleteTaskModal
          isOpen={taskToComplete !== null}
          task={taskToComplete}
          onConfirm={handleConfirmComplete}
          onCancel={handleCancelComplete}
        />

        {/* Modal de reasignar tarea */}
        <ReassignTaskModal
          isOpen={taskToReassign !== null}
          task={taskToReassign}
          members={getHomeMembers()}
          currentResponsible={taskToReassign ? getCurrentResponsible(taskToReassign) : null}
          onReassign={handleConfirmReassign}
          onCancel={handleCancelReassign}
          externalError={reassignModalError}
          currentUserId={currentUser?.id}
        />

        <VerifyTaskModal
          isOpen={taskToVerify !== null}
          task={taskToVerify}
          onConfirm={handleConfirmVerify}
          onCancel={handleCancelVerify}
        />

        <RejectTaskVerificationModal
          isOpen={taskToRejectVerification !== null}
          task={taskToRejectVerification}
          onConfirm={handleConfirmRejectVerification}
          onCancel={handleCancelRejectVerification}
        />
      </div>
    </div>
  );
}
