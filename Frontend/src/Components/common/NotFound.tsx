import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import Fondo from "../../assets/fondo.jpg";
import Logo from "../../assets/Logo.png";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={Fondo}
        alt="Fondo"
        className="absolute w-full h-full object-cover scale-105 blur-sm"
      />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
            <IconButton
              onClick={() => navigate('/')}
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

            <div className="flex flex-col items-center">
              <img src={Logo} alt="Logo" className="w-32 h-32 mb-6" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 text-center">
                Página no encontrada
              </h1>
              <p className="text-gray-700 text-center mb-6">
                Lo sentimos, la página que buscas no existe o no tienes acceso a ella.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-lg font-semibold
                         bg-gradient-to-r from-gray-900 to-gray-800 text-white
                         shadow-lg shadow-gray-900/30
                         hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300
                         transform transition-all duration-300 hover:scale-[1.02]
                         active:scale-[0.98]"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 