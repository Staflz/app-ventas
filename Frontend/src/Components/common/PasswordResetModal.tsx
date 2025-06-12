import React, { useState } from 'react';
import { Modal, Paper, Box, TextField, Button, IconButton } from '@mui/material';
import axios from 'axios';

interface PasswordResetModalProps {
  email: string;
  onClose?: () => void;
  onSuccess?: () => void;
  open: boolean;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  email,
  onClose,
  onSuccess,
  open
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handlePasswordReset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, { email });
      if (response.status === 200) {
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Error al solicitar el restablecimiento de contraseña');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="password-reset-modal"
      disableEscapeKeyDown
      disableAutoFocus
      disableEnforceFocus
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          p: 4,
          borderRadius: '1rem',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#1a1a1a',
            '&:hover': {
              color: '#4ade80',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          ×
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-700">
            Se enviará un enlace de restablecimiento a tu correo electrónico.
          </p>
        </Box>

        {success ? (
          <Box sx={{ textAlign: 'center', mb: 3, color: '#059669' }}>
            ¡Enlace enviado! Por favor, revisa tu correo electrónico.
          </Box>
        ) : (
          <>
            {error && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: '#fee2e2', 
                border: '1px solid #ef4444',
                color: '#b91c1c',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                {error}
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Correo electrónico"
                variant="outlined"
                value={email}
                disabled
                InputProps={{
                  readOnly: true
                }}
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
                onClick={handlePasswordReset}
                disabled={isLoading}
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
                  '&.Mui-disabled': {
                    background: '#e5e5e5',
                    color: '#9ca3af',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};

export default PasswordResetModal; 