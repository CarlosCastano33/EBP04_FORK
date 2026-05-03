import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function UserHeader() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout-success');
  };

  if (!currentUser) return null;

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Cerrar sesion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
