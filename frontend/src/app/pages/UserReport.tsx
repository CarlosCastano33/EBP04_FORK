import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, User, Users, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Task, User as AppUser } from '../types';

type MemberStats = {
  total: number;
  verified: number;
  onTime: number;
  late: number;
  rejected: number;
  pending: number;
};

function buildStats(tasks: Task[]): MemberStats {
  return tasks.reduce(
    (stats, task) => {
      stats.total += 1;

      if (task.status === 'verified') {
        stats.verified += 1;
        if (task.completedAt && task.dueDate && task.completedAt <= task.dueDate) {
          stats.onTime += 1;
        } else {
          stats.late += 1;
        }
      } else if (task.status === 'rejected' || task.status === 'verification_rejected') {
        stats.rejected += 1;
      } else {
        stats.pending += 1;
      }

      return stats;
    },
    { total: 0, verified: 0, onTime: 0, late: 0, rejected: 0, pending: 0 }
  );
}

function formatDate(value?: number) {
  return value ? new Date(value).toLocaleDateString('es-CO') : '-';
}

function statusLabel(task: Task) {
  const labels: Record<string, string> = {
    unassigned: 'Sin asignar',
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    in_progress: 'En progreso',
    completed: 'Lista para verificar',
    verified: 'Verificada',
    verification_rejected: 'Verificacion rechazada',
  };

  return labels[task.status || 'unassigned'] || 'Sin estado';
}

export function UserReport() {
  const { currentUser, getHomeTasks, getHomeMembers } = useAuth();
  const navigate = useNavigate();
  const [selectedMemberId, setSelectedMemberId] = useState('all');

  const members = getHomeMembers();
  const tasks = getHomeTasks().filter((task) => Boolean(task.assignedTo));

  const rows = useMemo(
    () =>
      members.map((member) => {
        const memberTasks = tasks.filter((task) => task.assignedTo === member.id);
        return { member, tasks: memberTasks, stats: buildStats(memberTasks) };
      }),
    [members, tasks]
  );

  if (!currentUser?.isAdmin) {
    return (
      <RestrictedReport onBack={() => navigate('/reports')} />
    );
  }

  const selectedRow = selectedMemberId === 'all'
    ? null
    : rows.find((row) => row.member.id === selectedMemberId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <button
          onClick={() => navigate('/reports')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver a reportes
        </button>

        <Card title="Reporte por usuario" maxWidth="max-w-6xl mx-auto">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Miembro del hogar
              </label>
              <select
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los miembros</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMemberId === 'all' ? (
            <MemberComparison rows={rows} />
          ) : selectedRow ? (
            <MemberDetail member={selectedRow.member} tasks={selectedRow.tasks} stats={selectedRow.stats} />
          ) : (
            <EmptyMembers />
          )}
        </Card>
      </div>
    </div>
  );
}

function MemberComparison({ rows }: { rows: { member: AppUser; stats: MemberStats }[] }) {
  if (rows.length === 0) return <EmptyMembers />;

  return (
    <div className="space-y-4">
      {rows.map(({ member, stats }) => {
        const completionRate = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

        return (
          <div key={member.id} className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role || 'Miembro'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{completionRate}%</p>
                <p className="text-xs text-gray-600">cumplimiento verificado</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <SmallStat label="Asignadas" value={stats.total} color="blue" />
              <SmallStat label="Verificadas" value={stats.verified} color="green" />
              <SmallStat label="A tiempo" value={stats.onTime} color="emerald" />
              <SmallStat label="Con retraso" value={stats.late} color="orange" />
              <SmallStat label="Pendientes" value={stats.pending} color="gray" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MemberDetail({ member, tasks, stats }: { member: AppUser; tasks: Task[]; stats: MemberStats }) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <User className="mx-auto mb-4 h-14 w-14 text-gray-400" />
        <p className="text-gray-600">{member.name} no tiene tareas asignadas.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <ReportStat icon={CheckCircle} label="Asignadas" value={stats.total} color="blue" />
        <ReportStat icon={CheckCircle} label="Verificadas" value={stats.verified} color="green" />
        <ReportStat icon={Clock} label="A tiempo" value={stats.onTime} color="emerald" />
        <ReportStat icon={Clock} label="Con retraso" value={stats.late} color="orange" />
        <ReportStat icon={AlertCircle} label="Pendientes" value={stats.pending} color="gray" />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700">Tareas de {member.name}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Tarea</th>
                <th className="px-5 py-3 text-left">Fecha limite</th>
                <th className="px-5 py-3 text-left">Completada</th>
                <th className="px-5 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{task.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{formatDate(task.dueDate)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{formatDate(task.completedAt)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {statusLabel(task)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ReportStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof CheckCircle;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'emerald' | 'orange' | 'gray';
}) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    gray: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className={`rounded-lg p-4 text-center ${styles[color]}`}>
      <Icon className="mx-auto mb-2 h-5 w-5" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-gray-600">{label}</p>
    </div>
  );
}

function SmallStat({ label, value, color }: { label: string; value: number; color: string }) {
  const className = color === 'green' || color === 'emerald'
    ? 'text-green-700'
    : color === 'orange'
    ? 'text-orange-700'
    : color === 'blue'
    ? 'text-blue-700'
    : 'text-gray-700';

  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${className}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function EmptyMembers() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto mb-4 h-14 w-14 text-gray-400" />
      <p className="text-gray-600">No hay miembros registrados para generar el reporte.</p>
    </div>
  );
}

function RestrictedReport({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <Card title="Acceso restringido" maxWidth="max-w-xl">
          <p className="mb-6 text-center text-gray-600">
            Solo los administradores pueden consultar este reporte.
          </p>
          <div className="text-center">
            <Button onClick={onBack}>Volver a reportes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
