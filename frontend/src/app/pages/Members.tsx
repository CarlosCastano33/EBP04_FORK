import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { ArrowLeft, UserPlus, Trash2, Shield } from 'lucide-react';

export function Members() {
  const { currentUser, getHomeMembers, addMemberToHome, removeMemberFromHome } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const members = getHomeMembers();

  const handleAddMember = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('El correo del usuario es obligatorio');
      return;
    }

    try {
      await addMemberToHome(email);
      setSuccess('Miembro agregado exitosamente');
      setEmail('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleConfirmRemove = async () => {
    if (memberToDelete) {
      try {
        await removeMemberFromHome(memberToDelete);
        setMemberToDelete(null);
        navigate('/member-remove-success');
      } catch (err) {
        setError((err as Error).message);
        setMemberToDelete(null);
      }
    }
  };

  const handleCancelRemove = () => {
    setMemberToDelete(null);
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card title="Acceso denegado">
          <p className="text-center text-gray-600 mb-4">
            Solo los administradores pueden gestionar miembros
          </p>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8 max-w-3xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>

        <Card title="Miembros del Hogar" maxWidth="max-w-3xl">
          <div className="mb-6">
            <Button
              onClick={() => navigate('/role-management')}
              variant="secondary"
              fullWidth
            >
              <Shield className="w-5 h-5 mr-2 inline" />
              Gestionar Roles
            </Button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="flex items-center text-sm text-blue-800">
              <UserPlus className="w-5 h-5 mr-2" />
              Agregar nuevo miembro
            </p>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                {success}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Input
                label=""
                value={email}
                onChange={setEmail}
                placeholder="Ingresa el correo del usuario"
              />
              <Button onClick={handleAddMember}>
                Agregar
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Miembros actuales ({members.length})</h3>

            {members.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay miembros en este hogar</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {member.id === currentUser.id && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Tú
                          </span>
                        )}
                        {member.role && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'Administrador' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'Miembro' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>

                    {member.id !== currentUser.id && !member.isAdmin && (
                      <button
                        onClick={() => setMemberToDelete(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={memberToDelete !== null}
        title="¿Deseas eliminar este usuario del hogar?"
        message={
          <>
            <p>Esta acción removerá al miembro de la lista.</p>
          </>
        }
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}
