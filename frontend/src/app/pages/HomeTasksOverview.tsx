import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  ClipboardList,
  Filter,
  History,
  User,
  XCircle,
} from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types';

type StatusFilter = 'Todos' | TaskStatus;
type OwnerFilter = 'Todos' | 'Sin asignar' | string;

export function HomeTasksOverview() {
  const { getHomeMembers, getHomeName, getHomeTasks } = useAuth();
  const navigate = useNavigate();

  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | TaskPriority>('Todas');
  const [sortBy, setSortBy] = useState<'status' | 'dueDate' | 'responsible'>('status');
  const [showFilters, setShowFilters] = useState(false);

  const members = getHomeMembers();
  const activeTasks = getHomeTasks().filter((task) => task.status !== 'verified');

  const filteredTasks = activeTasks
    .filter((task) => {
      if (ownerFilter === 'Sin asignar') return !task.assignedTo;
      if (ownerFilter !== 'Todos') return task.assignedTo === ownerFilter;
      return true;
    })
    .filter((task) => statusFilter === 'Todos' || (task.status || 'unassigned') === statusFilter)
    .filter((task) => priorityFilter === 'Todas' || task.priority === priorityFilter)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || Number.MAX_SAFE_INTEGER) - (b.dueDate || Number.MAX_SAFE_INTEGER);
      }

      if (sortBy === 'responsible') {
        return getMemberName(a.assignedTo).localeCompare(getMemberName(b.assignedTo));
      }

      const order: Record<string, number> = {
        unassigned: 0,
        pending: 1,
        accepted: 2,
        in_progress: 3,
        completed: 4,
        verification_rejected: 5,
        rejected: 6,
      };

      return order[a.status || 'unassigned'] - order[b.status || 'unassigned'];
    });

  const counts = {
    total: activeTasks.length,
    unassigned: activeTasks.filter((task) => !task.assignedTo).length,
    pending: activeTasks.filter((task) => task.status === 'pending').length,
    accepted: activeTasks.filter((task) => task.status === 'accepted').length,
    inProgress: activeTasks.filter((task) => task.status === 'in_progress').length,
    completed: activeTasks.filter(
      (task) => task.status === 'completed' || task.status === 'verification_rejected',
    ).length,
  };

  function getMemberName(userId?: string) {
    if (!userId) return 'Sin asignar';
    return members.find((member) => member.id === userId)?.name || 'Usuario desconocido';
  }

  function getCreatorName(userId: string) {
    return members.find((member) => member.id === userId)?.name || 'Usuario desconocido';
  }

  const clearFilters = () => {
    setOwnerFilter('Todos');
    setStatusFilter('Todos');
    setPriorityFilter('Todas');
  };

  const getStatusBadge = (status?: TaskStatus) => {
    const value = status || 'unassigned';
    const styles: Record<string, string> = {
      unassigned: 'bg-gray-100 text-gray-700 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
      completed: 'bg-purple-100 text-purple-700 border-purple-300',
      verification_rejected: 'bg-orange-100 text-orange-700 border-orange-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    const labels: Record<string, string> = {
      unassigned: 'Sin asignar',
      pending: 'Pendiente aceptacion',
      accepted: 'Aceptada',
      in_progress: 'En progreso',
      completed: 'Completada - pendiente verificacion',
      verification_rejected: 'Verificacion rechazada',
      rejected: 'Rechazada',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border font-medium ${styles[value]}`}>
        {labels[value]}
      </span>
    );
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

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return task.dueDate < todayOnly;
  };

  const hasActiveFilters =
    ownerFilter !== 'Todos' || statusFilter !== 'Todos' || priorityFilter !== 'Todas';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>

        <Card title={`Estado de tareas: ${getHomeName() || 'Mi hogar'}`} maxWidth="max-w-5xl mx-auto">
          <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <Summary label="Total" value={counts.total} tone="gray" />
            <Summary label="Sin asignar" value={counts.unassigned} tone="gray" />
            <Summary label="Pendientes" value={counts.pending} tone="yellow" />
            <Summary label="Aceptadas" value={counts.accepted} tone="green" />
            <Summary label="En progreso" value={counts.inProgress} tone="blue" />
            <Summary label="Completadas" value={counts.completed} tone="purple" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters((value) => !value)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
              <button
                onClick={() => navigate('/home-history')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <History className="w-4 h-4" />
                Historial
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <FilterRow label="Responsable">
                {['Todos', 'Sin asignar'].map((value) => (
                  <FilterButton
                    key={value}
                    selected={ownerFilter === value}
                    onClick={() => setOwnerFilter(value)}
                  >
                    {value}
                  </FilterButton>
                ))}
                {members.map((member) => (
                  <FilterButton
                    key={member.id}
                    selected={ownerFilter === member.id}
                    onClick={() => setOwnerFilter(member.id)}
                  >
                    {member.name}
                  </FilterButton>
                ))}
              </FilterRow>

              <FilterRow label="Estado">
                {[
                  ['Todos', 'Todos'],
                  ['unassigned', 'Sin asignar'],
                  ['pending', 'Pendiente'],
                  ['accepted', 'Aceptada'],
                  ['in_progress', 'En progreso'],
                  ['completed', 'Completada'],
                  ['verification_rejected', 'Verificacion rechazada'],
                  ['rejected', 'Rechazada'],
                ].map(([value, label]) => (
                  <FilterButton
                    key={value}
                    selected={statusFilter === value}
                    onClick={() => setStatusFilter(value as StatusFilter)}
                  >
                    {label}
                  </FilterButton>
                ))}
              </FilterRow>

              <FilterRow label="Prioridad">
                {['Todas', 'Alta', 'Media', 'Baja'].map((value) => (
                  <FilterButton
                    key={value}
                    selected={priorityFilter === value}
                    onClick={() => setPriorityFilter(value as 'Todas' | TaskPriority)}
                  >
                    {value}
                  </FilterButton>
                ))}
              </FilterRow>

              <FilterRow label="Orden">
                {[
                  ['status', 'Estado'],
                  ['dueDate', 'Fecha limite'],
                  ['responsible', 'Responsable'],
                ].map(([value, label]) => (
                  <FilterButton
                    key={value}
                    selected={sortBy === value}
                    onClick={() => setSortBy(value as 'status' | 'dueDate' | 'responsible')}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {label}
                  </FilterButton>
                ))}
              </FilterRow>
            </div>
          )}

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay tareas para mostrar.</p>
                <p className="text-sm text-gray-400">Ajusta los filtros o revisa el historial.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-800 font-medium mb-2 text-lg">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        {isOverdue(task) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-300 font-medium">
                            Vencida
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {getMemberName(task.assignedTo)}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Limite: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        <span>Creada por {getCreatorName(task.createdBy)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'gray' | 'yellow' | 'green' | 'blue' | 'purple';
}) {
  const styles = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-3 ${styles[tone]}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function FilterButton({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        selected ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
