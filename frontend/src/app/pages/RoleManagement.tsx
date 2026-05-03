import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

export function RoleManagement() {
  const { currentUser, getHomeMembers, assignRole } = useAuth();
  const navigate = useNavigate();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const members = getHomeMembers();

  const roleOptions = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Miembro', label: 'Miembro' },
    { value: 'Invitado', label: 'Invitado' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedMemberId) {
      newErrors.member = 'Debes seleccionar un miembro.';
    }

    if (!selectedRole) {
      newErrors.role = 'Debes seleccionar un rol.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssignRole = async () => {
    setSuccess(false);
    setGeneralError('');

    if (!validate()) return;

    try {
      await assignRole(selectedMemberId, selectedRole as UserRole);
      setSuccess(true);
      setSelectedMemberId('');
      setSelectedRole('');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setGeneralError((err as Error).message);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-700';
      case 'Miembro':
        return 'bg-blue-100 text-blue-700';
      case 'Invitado':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card title="Acceso denegado">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700 mb-4">
              No tienes permisos para gestionar roles.
            </p>
            <Button onClick={() => navigate('/dashboard')} fullWidth>
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <button
          onClick={() => navigate('/members')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a miembros
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Asignar Roles" maxWidth="max-w-full">
            <div className="space-y-4">
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">
                    Rol asignado correctamente.
                  </span>
                </div>
              )}

              {generalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {generalError}
                </div>
              )}

              <Select
                label="Seleccionar miembro"
                value={selectedMemberId}
                onChange={setSelectedMemberId}
                error={errors.member}
                required
                options={members
                  .filter((member) => member.id !== currentUser.id)
                  .map((member) => ({
                    value: member.id,
                    label: `${member.name} (${member.email})`,
                  }))}
              />

              <Select
                label="Seleccionar rol"
                value={selectedRole}
                onChange={setSelectedRole}
                error={errors.role}
                required
                options={roleOptions}
              />

              <Button onClick={handleAssignRole} fullWidth>
                Guardar cambios
              </Button>
            </div>
          </Card>

          <Card title="Miembros y Roles" maxWidth="max-w-full">
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay miembros en este hogar
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${getRoleBadgeColor(
                            member.role || 'Miembro',
                          )}`}
                        >
                          {member.role || 'Miembro'}
                        </span>
                        {member.id === currentUser.id && (
                          <span className="text-xs text-blue-600">Tu</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
