import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UserHeader } from '../components/UserHeader';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export function JoinHome() {
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya tiene hogar, redirigir al dashboard
  useEffect(() => {
    if (currentUser?.homeId) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // No renderizar nada si ya tiene hogar
  if (currentUser?.homeId) {
    return null;
  }

  const handleCopy = async () => {
    if (currentUser?.email) {
      try {
        await copyToClipboard(currentUser.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error al copiar:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />

      <div className="flex items-center justify-center p-4 pt-12">
        <Card title="Unirse a un hogar" maxWidth="max-w-lg">
          <div className="text-center space-y-6">
            <div className="p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-3">Este es tu correo de usuario</p>
              <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                <code className="text-blue-600 break-all">{currentUser?.email}</code>
              </div>
            </div>

            <Button onClick={handleCopy} fullWidth>
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2 inline" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2 inline" />
                  Copiar correo
                </>
              )}
            </Button>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Instrucciones:</strong> Comparte este correo con el administrador del hogar para que te agregue como miembro.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/home-selection')}
              fullWidth
            >
              Volver
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
