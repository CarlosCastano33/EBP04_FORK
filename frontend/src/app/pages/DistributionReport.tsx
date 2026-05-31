import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ArrowLeft, PieChart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function DistributionReport() {
  const { currentUser, getHomeTasks, getHomeMembers } = useAuth();
  const navigate = useNavigate();

  const members = getHomeMembers();
  const tasks = getHomeTasks();

  const distribution = useMemo(() => {
    const assignedTasks = tasks.filter((task) => Boolean(task.assignedTo) && task.status !== 'verified');
    const unassigned = tasks.filter((task) => !task.assignedTo || task.status === 'unassigned').length;
    const memberRows = members.map((member) => {
      const memberTasks = assignedTasks.filter((task) => task.assignedTo === member.id);
      return {
        member,
        total: memberTasks.length,
        active: memberTasks.filter((task) => ['pending', 'accepted', 'in_progress', 'completed', 'verification_rejected'].includes(task.status || '')).length,
      };
    });

    const totalAssigned = assignedTasks.length;
    const average = members.length > 0 ? totalAssigned / members.length : 0;
    const max = Math.max(...memberRows.map((row) => row.total), 0);
    const overloaded = memberRows.filter((row) => row.total > average * 1.5 && row.total >= average + 2);

    return { memberRows, totalAssigned, unassigned, average, max, overloaded };
  }, [members, tasks]);

  if (!currentUser?.isAdmin) {
    return (
      <RestrictedReport onBack={() => navigate('/reports')} />
    );
  }

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

        <Card title="Distribucion de tareas" maxWidth="max-w-6xl mx-auto">
          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <PieChart className="mx-auto mb-4 h-14 w-14 text-gray-400" />
              <p className="text-gray-600">No hay tareas registradas para analizar la distribucion.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-4">
                <SummaryCard icon={PieChart} label="Asignadas activas" value={distribution.totalAssigned} color="blue" />
                <SummaryCard icon={Users} label="Miembros" value={members.length} color="green" />
                <SummaryCard icon={Users} label="Promedio por miembro" value={distribution.average.toFixed(1)} color="purple" />
                <SummaryCard icon={AlertTriangle} label="Sin asignar" value={distribution.unassigned} color="orange" />
              </div>

              {distribution.overloaded.length > 0 && (
                <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                    <div>
                      <p className="font-semibold text-amber-800">Carga de trabajo desequilibrada</p>
                      <p className="text-sm text-amber-700">
                        {distribution.overloaded.map((row) => row.member.name).join(', ')} supera claramente el promedio de tareas asignadas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Carga por miembro</h3>
                {distribution.memberRows.map((row) => {
                  const percentage = distribution.max > 0 ? Math.round((row.total / distribution.max) * 100) : 0;
                  const share = distribution.totalAssigned > 0 ? Math.round((row.total / distribution.totalAssigned) * 100) : 0;
                  const isOverloaded = distribution.overloaded.some((item) => item.member.id === row.member.id);

                  return (
                    <div
                      key={row.member.id}
                      className={`rounded-lg border p-4 ${
                        isOverloaded ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isOverloaded ? 'bg-amber-200' : 'bg-blue-100'}`}>
                            <Users className={`h-5 w-5 ${isOverloaded ? 'text-amber-700' : 'text-blue-700'}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{row.member.name}</p>
                            <p className="text-xs text-gray-600">{row.member.role || 'Miembro'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-800">{row.total}</p>
                          <p className="text-xs text-gray-600">{share}% de tareas asignadas</p>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${isOverloaded ? 'bg-amber-500' : 'bg-blue-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>{row.active} activas</span>
                        <span>
                          {row.total > distribution.average
                            ? `+${(row.total - distribution.average).toFixed(1)} vs promedio`
                            : `${(row.total - distribution.average).toFixed(1)} vs promedio`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof PieChart;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className={`rounded-lg p-5 text-center ${styles[color]}`}>
      <Icon className="mx-auto mb-2 h-6 w-6" />
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
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
