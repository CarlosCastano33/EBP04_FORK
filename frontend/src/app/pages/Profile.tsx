import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [age, setAge] = useState(currentUser?.age?.toString() || '');
  const [sex, setSex] = useState(currentUser?.sex || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!email.trim()) newErrors.email = 'El correo es obligatorio';
    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!age) newErrors.age = 'La edad es obligatoria';
    if (!sex) newErrors.sex = 'El sexo es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await updateProfile({
      name,
      email,
      phone,
      age: parseInt(age),
      sex,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-2xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>

        <Card title="Mi Perfil" maxWidth="max-w-2xl">
          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              Cambios guardados exitosamente
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Correo de usuario</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-800 break-all">{currentUser?.email}</code>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

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
              onChange={setEmail}
              error={errors.email}
              required
            />

            <Input
              label="Número de teléfono"
              type="tel"
              value={phone}
              onChange={setPhone}
              error={errors.phone}
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
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')} fullWidth>
              Cancelar
            </Button>
            <Button onClick={handleSave} fullWidth>
              Guardar cambios
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
