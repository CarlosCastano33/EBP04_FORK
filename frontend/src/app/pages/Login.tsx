import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 300000; // 5 minutos en milisegundos

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Verificar si hay un bloqueo activo al cargar la página
  useEffect(() => {
    const lockoutData = localStorage.getItem('loginLockout');
    if (lockoutData) {
      const { lockoutUntil, attempts } = JSON.parse(lockoutData);
      const now = Date.now();

      if (lockoutUntil > now) {
        // Aún está bloqueado
        setIsLocked(true);
        setFailedAttempts(attempts);
        setRemainingTime(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        // El bloqueo expiró
        localStorage.removeItem('loginLockout');
        setFailedAttempts(0);
        setIsLocked(false);
      }
    }
  }, []);

  // Contador regresivo del tiempo de bloqueo
  useEffect(() => {
    if (isLocked && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setFailedAttempts(0);
            localStorage.removeItem('loginLockout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, remainingTime]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validación de correo
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else {
      // Validación de formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'El correo no es válido.';
      }
    }

    if (!password.trim()) newErrors.password = 'La contraseña es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Verificar si está bloqueado
    if (isLocked) {
      return;
    }

    if (!validate()) return;

    try {
      await login(email, password);

      // Login exitoso - resetear intentos fallidos
      setFailedAttempts(0);
      localStorage.removeItem('loginLockout');

      // Obtener usuario del localStorage después del login
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);

        // Si no tiene perfil completo, redirigir a completar perfil
        if (!user.phone || !user.age || !user.sex) {
          navigate('/profile-setup');
          return;
        }

        // Si no tiene hogar, redirigir a selección de hogar
        if (!user.homeId) {
          navigate('/home-selection');
          return;
        }
      }

      // Si todo está completo, ir al dashboard
      navigate('/dashboard');
    } catch (error) {
      // Login fallido - incrementar contador
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        // Bloquear la cuenta
        const lockoutUntil = Date.now() + LOCKOUT_TIME;
        localStorage.setItem('loginLockout', JSON.stringify({
          lockoutUntil,
          attempts: newAttempts
        }));
        setIsLocked(true);
        setRemainingTime(Math.ceil(LOCKOUT_TIME / 1000));
        setGeneralError('Has superado el máximo de 5 intentos fallidos. El acceso ha sido bloqueado temporalmente por seguridad.');
      } else {
        setGeneralError((error as Error).message);
      }
    }
  };

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card title="Iniciar sesión">
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {generalError}
            </div>
          )}

          {isLocked && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-800 font-medium mb-1">
                Cuenta bloqueada temporalmente
              </p>
              <p className="text-xs text-amber-700">
                Tiempo restante: {formatTime(remainingTime)}
              </p>
            </div>
          )}

          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />

          <Button type="submit" fullWidth disabled={isLocked}>
            {isLocked ? 'Bloqueado temporalmente' : 'Iniciar sesión'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline"
            >
              Regístrate
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
}
