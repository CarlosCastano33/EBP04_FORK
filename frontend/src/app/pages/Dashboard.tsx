import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Users, Home, Shield, ClipboardList, Inbox, CheckSquare, LayoutList, History, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';
import { NotificationBell } from '../components/NotificationBell';

export function Dashboard() {
  const {
    currentUser,
    homes,
    selectedHouseholdId,
    getHomeName,
    getHomeTasks,
    selectHousehold,
  } = useAuth();
  const navigate = useNavigate();

  // Contar tareas pendientes para el usuario actual
  const allTasks = currentUser?.homeId ? getHomeTasks() : [];
  const pendingTasksCount = allTasks.filter(
    task => task.assignedTo === currentUser?.id && task.status === 'pending'
  ).length;

  const handleLogout = () => {
    navigate('/logout-success');
  };

  const handleHouseholdChange = async (householdId: string) => {
    if (!householdId || householdId === selectedHouseholdId) return;
    await selectHousehold(householdId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="mb-2">Bienvenido, {currentUser?.name}</h1>
                {currentUser?.homeId && (
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <Home className="w-5 h-5" />
                    {homes.length > 1 ? (
                      <select
                        aria-label="Hogar activo"
                        value={selectedHouseholdId || currentUser.homeId}
                        onChange={(event) => handleHouseholdChange(event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {homes.map((home) => (
                          <option key={home.id} value={home.id}>
                            {home.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getHomeName()}</span>
                    )}
                    {currentUser.isAdmin && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Administrador
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />

                <Button onClick={handleLogout} variant="secondary">
                  <LogOut className="w-5 h-5 mr-2 inline" />
                  Cerrar sesión
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-left"
              >
                <User className="w-8 h-8 mb-3" />
                <p className="mb-1">Mi Perfil</p>
                <p className="text-sm text-blue-100">Ver y editar información personal</p>
              </button>

              {currentUser?.isAdmin ? (
                <>
                  <button
                    onClick={() => navigate('/my-tasks')}
                    className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-md text-left"
                  >
                    <CheckSquare className="w-8 h-8 mb-3" />
                    <p className="mb-1">Mis Tareas</p>
                    <p className="text-sm text-teal-100">Ver únicamente mis tareas asignadas</p>
                  </button>

                  <button
                    onClick={() => navigate('/members')}
                    className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md text-left"
                  >
                    <Users className="w-8 h-8 mb-3" />
                    <p className="mb-1">Miembros del Hogar</p>
                    <p className="text-sm text-indigo-100">Gestionar lista de miembros</p>
                  </button>

                  <button
                    onClick={() => navigate('/role-management')}
                    className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-md text-left"
                  >
                    <Shield className="w-8 h-8 mb-3" />
                    <p className="mb-1">Gestion de Roles</p>
                    <p className="text-sm text-purple-100">Asignar roles a miembros</p>
                  </button>

                  <button
                    onClick={() => navigate('/tasks')}
                    className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md text-left"
                  >
                    <ClipboardList className="w-8 h-8 mb-3" />
                    <p className="mb-1">Tareas Domésticas</p>
                    <p className="text-sm text-green-100">Crear y gestionar todas las tareas</p>
                  </button>

                  <button
                    onClick={() => navigate('/home-tasks-overview')}
                    className="p-6 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md text-left"
                  >
                    <LayoutList className="w-8 h-8 mb-3" />
                    <p className="mb-1">Estado de tareas</p>
                    <p className="text-sm text-sky-100">Consultar avance del hogar</p>
                  </button>

                  <button
                    onClick={() => navigate('/reports')}
                    className="p-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl text-white hover:from-rose-600 hover:to-rose-700 transition-all shadow-md text-left"
                  >
                    <BarChart3 className="w-8 h-8 mb-3" />
                    <p className="mb-1">Reportes</p>
                    <p className="text-sm text-rose-100">Consultar cumplimiento y distribucion</p>
                  </button>
                </>
              ) : currentUser?.role === 'Miembro' ? (
                <>
                  <button
                    onClick={() => navigate('/my-tasks')}
                    className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all shadow-md text-left"
                  >
                    <CheckSquare className="w-8 h-8 mb-3" />
                    <p className="mb-1">Mis Tareas</p>
                    <p className="text-sm text-green-100">Ver tus tareas asignadas</p>
                  </button>

                  <button
                    onClick={() => navigate('/pending-tasks')}
                    className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-md text-left relative"
                  >
                    <Inbox className="w-8 h-8 mb-3" />
                    <p className="mb-1">Tareas pendientes</p>
                    <p className="text-sm text-amber-100">Revisar tareas asignadas</p>
                    {pendingTasksCount > 0 && (
                      <span className="absolute top-4 right-4 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {pendingTasksCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/home-tasks-overview')}
                    className="p-6 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md text-left"
                  >
                    <LayoutList className="w-8 h-8 mb-3" />
                    <p className="mb-1">Estado del hogar</p>
                    <p className="text-sm text-sky-100">Ver avance de tareas</p>
                  </button>
                </>
              ) : currentUser?.role === 'Invitado' ? (
                <>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="p-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-md text-left"
                  >
                    <ClipboardList className="w-8 h-8 mb-3" />
                    <p className="mb-1">Ver Tareas del Hogar</p>
                    <p className="text-sm text-gray-100">Solo lectura</p>
                  </button>

                  <button
                    onClick={() => navigate('/home-tasks-overview')}
                    className="p-6 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md text-left"
                  >
                    <History className="w-8 h-8 mb-3" />
                    <p className="mb-1">Estado e historial</p>
                    <p className="text-sm text-sky-100">Consultar avance</p>
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {!currentUser?.homeId && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 mb-4">
                No estás vinculado a ningún hogar. Para acceder a todas las funcionalidades, necesitas crear o unirte a un hogar.
              </p>
              <Button onClick={() => navigate('/home-selection')}>
                Vincular a un hogar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
