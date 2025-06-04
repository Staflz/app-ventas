import { useState } from "react";
import Video from "../../assets/Video.mp4";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerificationAlert from '../common/VerificationAlert';

// Frontend para la login page

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Limpiar error cuando el usuario modifica el formulario
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      //const response = await//
      axios.post('http://localhost:3000/api/auth/login', {
        email: form.email,
        password: form.password
      });

      setPendingEmail(form.email);
      setShowVerification(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Error al iniciar sesión');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    console.log('handleVerificationSuccess llamado, guardando usuario y redirigiendo...');
    localStorage.setItem('user', JSON.stringify({ email: pendingEmail }));
    console.log('Usuario guardado, redirigiendo a dashboard...');
    navigate('/dashboard');
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
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 text-center">
              Iniciar Sesión
            </h1>
            <p className="text-gray-700 text-center mb-10">
              Ingresa tus credenciales
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {showVerification && pendingEmail ? (
              <VerificationAlert
                email={pendingEmail}
                onVerificationSuccess={handleVerificationSuccess}
                onClose={() => setShowVerification(false)}
              />
            ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2 mb-6">
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="ejemplo@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <input
                    required
                    type="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-lg
                           font-semibold shadow-lg shadow-gray-900/30
                           hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300
                           transform transition-all duration-300 hover:scale-[1.02]
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                           ${isLoading ? 'animate-pulse' : ''}`}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;