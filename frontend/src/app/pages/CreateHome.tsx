import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { UserHeader } from '../components/UserHeader';

export function CreateHome() {
  const [homeName, setHomeName] = useState('');
  const [error, setError] = useState('');

  const { createHome } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!homeName.trim()) {
      setError('El nombre del hogar es obligatorio');
      return;
    }

    try {
      await createHome(homeName);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />

      <div className="flex items-center justify-center p-4 pt-12">
        <Card title="Crear nuevo hogar">
          <p className="text-sm text-gray-600 mb-6 text-center">
            Serás el administrador de este hogar y quedará seleccionado como hogar activo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del hogar"
              value={homeName}
              onChange={setHomeName}
              error={error}
              placeholder="Ej: Casa familiar, Apartamento 3B"
              required
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/home-selection')}
                fullWidth
              >
                Atrás
              </Button>
              <Button type="submit" fullWidth>
                Crear hogar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
