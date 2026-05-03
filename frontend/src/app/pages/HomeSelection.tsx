import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { UserHeader } from '../components/UserHeader';
import { Home, Users } from 'lucide-react';

export function HomeSelection() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya tiene hogar, redirigir al dashboard
  useEffect(() => {
    if (currentUser?.homeId) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // No renderizar nada si ya tiene hogar (evitar parpadeo)
  if (currentUser?.homeId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />

      <div className="flex items-center justify-center p-4 pt-12">
        <Card title="Vinculación al hogar" maxWidth="max-w-2xl">
          <p className="text-sm text-gray-600 mb-8 text-center">
            Elige cómo quieres gestionar tu hogar compartido
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/create-home')}
              className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="w-8 h-8" />
                </div>
                <div>
                  <p className="mb-2">Crear un hogar</p>
                  <p className="text-sm text-blue-100">
                    Crea un nuevo hogar y conviértete en administrador
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/join-home')}
              className="p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="mb-2">Unirse a un hogar</p>
                  <p className="text-sm text-indigo-100">
                    Comparte tu correo para que te agreguen a un hogar existente
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
