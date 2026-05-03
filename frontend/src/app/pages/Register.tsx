import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState<'register' | 'success' | 'profile'>('register');

  const { register, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Validación en tiempo real para el correo electrónico
  const validateEmailRealTime = (emailValue: string) => {
    if (emailValue.length === 0) return; // No mostrar error si está vacío

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      setErrors(prev => ({ ...prev, email: 'El correo electrónico no es válido.' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  // Validación en tiempo real para la contraseña
  const validatePasswordRealTime = (pwd: string) => {
    if (pwd.length === 0) return; // No mostrar error si está vacío

    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
      setErrors(prev => ({ ...prev, password: 'La contraseña no cumple los requisitos mínimos.' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };

  // Validación en tiempo real para confirmación de contraseña
  const validateConfirmPasswordRealTime = (confirmPwd: string, pwd: string) => {
    if (confirmPwd.length === 0) return; // No mostrar error si está vacío

    if (confirmPwd !== pwd) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden.' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  // Manejador de cambio de correo electrónico
  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmailRealTime(value);
  };

  // Manejador de cambio de contraseña
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePasswordRealTime(value);
    // Re-validar confirmación si ya tiene contenido
    if (confirmPassword.length > 0) {
      validateConfirmPasswordRealTime(confirmPassword, value);
    }
  };

  // Manejador de cambio de confirmación de contraseña
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validateConfirmPasswordRealTime(value, password);
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};

    // Validación de nombre
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

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

    // Validación de contraseña
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else {
      // Verificar todos los requisitos
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
        newErrors.password = 'La contraseña no cumple los requisitos mínimos.';
      }
    }

    // Validación de confirmar contraseña
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!age) newErrors.age = 'La edad es obligatoria';
    if (!sex) newErrors.sex = 'El sexo es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateRegister()) return;

    try {
      await register(name, email, password);
      setStep('success');
      setTimeout(() => {
        setStep('profile');
      }, 2000);
    } catch (error) {
      setGeneralError((error as Error).message);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) return;

    await updateProfile({
      phone,
      age: parseInt(age),
      sex,
    });

    navigate('/home-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card title={step === 'profile' ? 'Completa tu perfil' : 'Crear cuenta'}>
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {generalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {generalError}
              </div>
            )}

            <Input
              label="Nombre"
              value={name}
              onChange={setName}
              error={errors.name}
              required
            />

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={errors.confirmPassword}
              required
            />

            <Button type="submit" fullWidth>
              Registrarse
            </Button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Registro exitoso!</h2>
            <p className="text-sm text-gray-600">Completemos tu perfil...</p>
          </div>
        )}

        {step === 'profile' && (
          <>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Necesitamos algunos datos adicionales para continuar
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Número de teléfono"
                type="tel"
                value={phone}
                onChange={setPhone}
                error={errors.phone}
                placeholder="+34 600 000 000"
                required
              />

              <Input
                label="Edad"
                type="number"
                value={age}
                onChange={setAge}
                error={errors.age}
                required
              />

              <Select
                label="Sexo"
                value={sex}
                onChange={setSex}
                error={errors.sex}
                required
                options={[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-say', label: 'Prefiero no decir' },
                ]}
              />

              <Button type="submit" fullWidth>
                Continuar
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
