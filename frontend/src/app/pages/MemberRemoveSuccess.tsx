import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function MemberRemoveSuccess() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    // Contador regresivo
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirigir después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/members');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-12">
        <div className="text-center">
          {/* Ícono de éxito */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            ✅ El usuario se eliminó exitosamente.
          </h1>

          {/* Mensaje */}
          <p className="text-gray-500 text-sm">
            Serás redirigido a la lista de miembros en <span className="font-semibold text-blue-600">{seconds}</span> segundo{seconds !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}
