import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle, ClipboardList, Filter, User, X } from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority } from '../types';

export function HomeHistoryOverview() {
  const { getHomeMembers, getHomeTasks } = useAuth();
  const navigate = useNavigate();
  const [memberFilter, setMemberFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'completed' | 'verified'>('Todas');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const members = getHomeMembers();
  const historyTasks = getHomeTasks()
    .filter((task) => task.status === 'completed' || task.status === 'verified')
    .filter((task) => memberFilter === 'Todos' || task.assignedTo === memberFilter)
    .filter((task) => statusFilter === 'Todas' || task.status === statusFilter)
    .sort((a, b) => (b.verifiedAt || b.completedAt || 0) - (a.verifiedAt || a.completedAt || 0));

  const getMemberName = (userId?: string) => {
    if (!userId) return 'Sin asignar';
    return members.find((member) => member.id === userId)?.name || 'Usuario desconocido';
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
    if (!priority) return null;

    const styles: Record<TaskPriority, string> = {
      Alta: 'bg-red-100 text-red-700 border-red-300',
      Media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Baja: 'bg-green-100 text-green-700 border-green-300',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700 border border-teal-300 font-medium">
          Verificada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-300 font-medium">
        Completada - pendiente verificacion
      </span>
    );
  };

  if (selectedTask) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={() => setSelectedTask(null)}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{selectedTask.name}</h2>
              {getStatusBadge(selectedTask.status)}
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {selectedTask.description && (
            <p className="text-sm text-gray-600 mb-4">{selectedTask.description}</p>
          )}

          <div className="space-y-3 mb-6">
            {selectedTask.priority && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Prioridad:</span>
                {getPriorityBadge(selectedTask.priority)}
              </div>
            )}
            {selectedTask.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-500" />
                Fecha limite: {new Date(selectedTask.dueDate).toLocaleDateString('es-ES')}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-500" />
              Responsable: <strong>{getMemberName(selectedTask.assignedTo)}</strong>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Linea de tiempo</h3>
            <Timeline label="Creada" value={selectedTask.createdAt} />
            {selectedTask.startedAt && <Timeline label="Iniciada" value={selectedTask.startedAt} />}
            {selectedTask.completedAt && (
              <Timeline label="Completada" value={selectedTask.completedAt} />
            )}
            {selectedTask.verifiedAt && (
              <Timeline
                label={`Verificada por ${getMemberName(selectedTask.verifiedBy)}`}
                value={selectedTask.verifiedAt}
              />
            )}
          </div>

          <button
            onClick={() => setSelectedTask(null)}
            className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-5xl">
        <button
          onClick={() => navigate('/home-tasks-overview')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al estado de tareas
        </button>

        <Card title="Historial de tareas" maxWidth="max-w-5xl mx-auto">
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-700">
              <strong className="text-lg">{historyTasks.length}</strong>{' '}
              {historyTasks.length === 1 ? 'tarea registrada' : 'tareas registradas'} en el
              historial.
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-700">Filtros</h3>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Estado</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  ['Todas', 'Todas'],
                  ['completed', 'Completada'],
                  ['verified', 'Verificada'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value as 'Todas' | 'completed' | 'verified')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Miembro</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setMemberFilter('Todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    memberFilter === 'Todos'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Todos
                </button>
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setMemberFilter(member.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      memberFilter === member.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {historyTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay tareas en el historial.</p>
                <p className="text-sm text-gray-400">
                  Las tareas completadas o verificadas apareceran aqui.
                </p>
              </div>
            ) : (
              historyTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="w-full p-5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-800 font-medium mb-2 text-lg">{task.name}</h4>
                      <div className="mb-3">{getStatusBadge(task.status)}</div>
                      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {getMemberName(task.assignedTo)}
                        </span>
                        {task.completedAt && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            Completada: {new Date(task.completedAt).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {task.verifiedAt && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Verificada: {new Date(task.verifiedAt).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Timeline({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5" />
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">
          {new Date(value).toLocaleDateString('es-ES')} a las{' '}
          {new Date(value).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
