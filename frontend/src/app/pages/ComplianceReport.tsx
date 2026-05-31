import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Task } from '../types';

type Period = '7d' | '30d' | '90d' | '180d' | 'year' | 'all';

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: 'Ultima semana' },
  { value: '30d', label: 'Ultimo mes' },
  { value: '90d', label: 'Ultimos 3 meses' },
  { value: '180d', label: 'Ultimos 6 meses' },
  { value: 'year', label: 'Este ano' },
  { value: 'all', label: 'Todo' },
];

function formatDate(value?: number) {
  return value ? new Date(value).toLocaleDateString('es-CO') : '-';
}

function isInPeriod(task: Task, period: Period) {
  if (period === 'all') return true;

  const createdAt = task.createdAt;
  const now = Date.now();

  if (period === 'year') {
    return new Date(createdAt).getFullYear() === new Date(now).getFullYear();
  }

  const days = Number(period.replace('d', ''));
  return now - createdAt <= days * 24 * 60 * 60 * 1000;
}

export function ComplianceReport() {
  const { currentUser, getHomeTasks, getHomeMembers } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('30d');

  const members = getHomeMembers();
  const filteredTasks = useMemo(
    () => getHomeTasks().filter((task) => isInPeriod(task, period)),
    [getHomeTasks, period]
  );

  if (!currentUser?.isAdmin) {
    return (
      <RestrictedReport onBack={() => navigate('/reports')} />
    );
  }

  const metrics = filteredTasks.reduce(
    (summary, task) => {
      const verified = task.status === 'verified' && Boolean(task.completedAt);

      if (verified && task.dueDate && task.completedAt && task.completedAt <= task.dueDate) {
        summary.onTime += 1;
      } else if (verified) {
        summary.late += 1;
      } else {
        summary.pending += 1;
      }

      return summary;
    },
    { onTime: 0, late: 0, pending: 0 }
  );

  const total = filteredTasks.length;
  const percent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  const memberName = (userId?: string) =>
    members.find((member) => member.id === userId)?.name || 'Sin asignar';

  const complianceLabel = (task: Task) => {
    if (task.status === 'verified' && task.completedAt && task.dueDate && task.completedAt <= task.dueDate) {
      return { text: 'A tiempo', className: 'bg-green-100 text-green-700 border-green-200' };
    }

    if (task.status === 'verified') {
      return { text: 'Con retraso', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    }

    return { text: 'Pendiente', className: 'bg-red-100 text-red-700 border-red-200' };
  };

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

        <Card title="Reporte de cumplimiento" maxWidth="max-w-6xl mx-auto">
          <PeriodSelector value={period} onChange={setPeriod} />

          {total === 0 ? (
            <EmptyState icon={FileText} text="No hay tareas registradas en el periodo seleccionado." />
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <MetricCard
                  icon={CheckCircle}
                  label="Completadas a tiempo"
                  value={`${percent(metrics.onTime)}%`}
                  detail={`${metrics.onTime} de ${total} tareas`}
                  color="green"
                />
                <MetricCard
                  icon={Clock}
                  label="Completadas con retraso"
                  value={`${percent(metrics.late)}%`}
                  detail={`${metrics.late} de ${total} tareas`}
                  color="orange"
                />
                <MetricCard
                  icon={AlertCircle}
                  label="Pendientes o no verificadas"
                  value={`${percent(metrics.pending)}%`}
                  detail={`${metrics.pending} de ${total} tareas`}
                  color="red"
                />
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                  <h3 className="text-sm font-semibold text-gray-700">Detalle de tareas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-5 py-3 text-left">Tarea</th>
                        <th className="px-5 py-3 text-left">Responsable</th>
                        <th className="px-5 py-3 text-left">Fecha limite</th>
                        <th className="px-5 py-3 text-left">Completada</th>
                        <th className="px-5 py-3 text-left">Cumplimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTasks.map((task) => {
                        const status = complianceLabel(task);
                        return (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-5 py-4 text-sm font-medium text-gray-900">{task.name}</td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {memberName(task.assignedTo)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(task.dueDate)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">{formatDate(task.completedAt)}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}>
                                {status.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function PeriodSelector({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">Periodo</p>
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              value === period.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: typeof CheckCircle;
  label: string;
  value: string;
  detail: string;
  color: 'green' | 'orange' | 'red';
}) {
  const styles = {
    green: 'border-green-200 bg-green-50 text-green-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${styles[color]}`}>
      <div className="mb-3 flex items-start justify-between">
        <Icon className="h-7 w-7" />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h4 className="font-semibold text-gray-800">{label}</h4>
      <p className="mt-1 text-sm text-gray-600">{detail}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto mb-4 h-14 w-14 text-gray-400" />
      <p className="text-gray-600">{text}</p>
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
