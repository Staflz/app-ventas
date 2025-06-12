import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Video from '../../assets/Video.mp4';
import axios from 'axios';
import { IconButton } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar si hay un token en la URL
    const token = searchParams.get('token');
    if (!token) {
      setError('Enlace de restablecimiento inválido o expirado');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const token = searchParams.get('token');
      const { data } = await axios.post(`${API_URL}/api/auth/update-password`, {
        token,
        password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Error al restablecer la contraseña');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        className="absolute w-full h-full object-cover scale-105 blur-sm"
        src={Video}
      />

      {/* Overlay para oscurecer ligeramente el video */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Contenido */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50 relative">
            <IconButton
              onClick={() => navigate('/login')}
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                color: '#1a1a1a',
                '&:hover': {
                  color: '#4ade80',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              ‹
            </IconButton>

            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 text-center">
              Restablecer Contraseña
            </h1>
            <p className="text-gray-700 text-center mb-10">
              Ingresa tu nueva contraseña
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Contraseña actualizada exitosamente. Redirigiendo al login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2 mb-6">
                  <input
                    required
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <input
                    required
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`px-8 py-3 rounded-lg font-semibold
                           bg-gradient-to-r from-gray-900 to-gray-800 text-white
                           shadow-lg shadow-gray-900/30
                           hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300
                           transform transition-all duration-300 hover:scale-[1.02]
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                           ${isLoading ? 'animate-pulse' : ''}`}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 