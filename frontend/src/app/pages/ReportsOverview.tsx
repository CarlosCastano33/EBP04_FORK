import { useNavigate } from 'react-router';
import { ArrowLeft, BarChart3, Lock, PieChart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const reports = [
  {
    title: 'Reporte de cumplimiento',
    description: 'Tareas verificadas a tiempo, con retraso y pendientes.',
    path: '/reports/compliance',
    icon: BarChart3,
  },
  {
    title: 'Reporte por usuario',
    description: 'Participacion y cumplimiento individual de cada miembro.',
    path: '/reports/user',
    icon: Users,
  },
  {
    title: 'Distribucion de tareas',
    description: 'Carga asignada a cada miembro del hogar.',
    path: '/reports/distribution',
    icon: PieChart,
  },
];

export function ReportsOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <Card title="Acceso restringido" maxWidth="max-w-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Lock className="h-7 w-7 text-red-600" />
              </div>
              <p className="mb-6 text-gray-600">
                Solo los administradores del hogar pueden consultar los reportes.
              </p>
              <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-5xl py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver al inicio
        </button>

        <Card title="Reportes del hogar" maxWidth="max-w-5xl mx-auto">
          <p className="mb-6 text-sm text-gray-600">
            Consulta indicadores de cumplimiento, participacion y distribucion de tareas.
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.path}
                  onClick={() => navigate(report.path)}
                  className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-left shadow-sm transition-all hover:border-green-300 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Icon className="h-6 w-6 text-green-700" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
