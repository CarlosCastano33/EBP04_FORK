import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { UserHeader } from '../components/UserHeader';

export function ProfileSetup() {
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Si el perfil ya está completo y tiene hogar, ir al dashboard
  useEffect(() => {
    if (currentUser?.phone && currentUser?.age && currentUser?.sex && currentUser?.homeId) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!age) newErrors.age = 'La edad es obligatoria';
    if (!sex) newErrors.sex = 'El sexo es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await updateProfile({
      phone,
      age: parseInt(age),
      sex,
    });

    // Después de actualizar el perfil, verificar si ya tiene hogar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.homeId) {
        navigate('/dashboard');
        return;
      }
    }

    navigate('/home-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />

      <div className="flex items-center justify-center p-4 pt-12">
        <Card title="Completa tu perfil">
          <p className="text-sm text-gray-600 mb-6 text-center">
            Necesitamos algunos datos adicionales para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
        </Card>
      </div>
    </div>
  );
}
