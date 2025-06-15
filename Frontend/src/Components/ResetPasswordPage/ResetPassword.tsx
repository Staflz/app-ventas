import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Box, Alert, IconButton } from '@mui/material';
import Fondo from "../../assets/fondo.jpg";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Leer token_hash y type de los query params
  const params = new URLSearchParams(window.location.search);
  const token_hash = params.get('token_hash');
  const type = params.get('type');

  console.log('[ResetPassword] token_hash:', token_hash, 'type:', type);

  if (!token_hash || !type) {
    console.log('[ResetPassword] No se encontró token_hash o type, renderizando error');
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
              <Alert severity="error" sx={{ mb: 2 }}>
                Enlace inválido o expirado. Por favor, solicita un nuevo enlace de reseteo.
              </Alert>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(to right, #1a1a1a, #4a4a4a)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #2a2a2a, #5a5a5a)',
                    color: '#4ade80',
                    transform: 'scale(1.02)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Volver al login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar contraseñas
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      console.log('[ResetPassword] Enviando token_hash y type al endpoint:', token_hash, type);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/update-password`, {
        token_hash,
        type,
        password
      });

      setSuccess('Contraseña actualizada exitosamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar la contraseña');
      console.log('[ResetPassword] Error al enviar token al endpoint:', error);
    }
  };

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
            <p className="text-gray-700 text-center mb-6">
              Ingresa tu nueva contraseña
            </p>

            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Nueva Contraseña"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover fieldset': {
                      borderColor: '#1a1a1a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover fieldset': {
                      borderColor: '#1a1a1a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1a1a1a',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                sx={{
                  mt: 3,
                  mb: 2,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(to right, #1a1a1a, #4a4a4a)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #2a2a2a, #5a5a5a)',
                    color: '#4ade80',
                    transform: 'scale(1.02)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Actualizar Contraseña
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 