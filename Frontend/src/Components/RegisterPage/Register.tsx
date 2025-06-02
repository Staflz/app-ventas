import { useState } from "react";
import Video from "../../assets/Video.mp4";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!form.email.includes("@")) {
      newErrors.push("Digita un correo electrónico válido");
    }

    if (form.username === "yaExiste") {
      newErrors.push("El negocio ya existe");
    }

    setErrors(newErrors);
    if (newErrors.length === 0) {
      console.log("Formulario válido:", form);
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
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 text-center">
              Registrar
            </h1>
            <p className="text-gray-700 text-center mb-10">
              Rellena la siguiente información
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2 mb-6">
                  <input
                    type="text"
                    name="username"
                    placeholder="Ingresa tu usuario"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <input
                    type="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <input
                    type="email"
                    name="email"
                    placeholder="ejemplo@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                             transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-lg
                           font-semibold shadow-lg shadow-gray-900/30
                           hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300
                           transform transition-all duration-300 hover:scale-[1.02]
                           active:scale-[0.98]"
                >
                  Registrarse
                </button>
              </div>
            </form>

            {errors.length > 0 && (
              <div className="mt-8 space-y-2">
                {errors.map((err, i) => (
                  <p key={i} className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-lg">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;