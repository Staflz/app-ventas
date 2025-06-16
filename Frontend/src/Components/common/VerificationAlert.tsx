//, useEffect//
import React, { useState} from 'react';
import { Modal, Paper, Box, TextField, Button, IconButton } from '@mui/material';
import axios from 'axios';


interface VerificationAlertProps {
  email: string;
  onClose?: () => void;
  onVerificationSuccess?: () => void;
  open: boolean;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({ 
  email, 
  onClose,
  onVerificationSuccess,
  open
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingCode, setRequestingCode] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Función para solicitar/generar el código de verificación
  const requestVerificationCode = async () => {
    setRequestingCode(true);
    setRequestError(null);
    setCodeSent(false);
    try {
      const response = await axios.post(`${API_URL}/api/auth/request-verification-code`, { email });
      if (response.status === 200) {
        setCodeSent(true);
        console.log('Código enviado exitosamente');
      } else {
        setRequestError('Error al solicitar el código de verificación.');
      }
    } catch (err) {
      setRequestError('No se pudo enviar el código de verificación. Intenta más tarde.');
    } finally {
      setRequestingCode(false);
    }
  };

  // Función para verificar el código
  const handleVerification = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Intentando verificar código...');
      const response = await axios.post(`${API_URL}/api/auth/verify-code`, {
        email,
        code
      });
      console.log('Respuesta de verificación:', response.data);
      
      if (response.data.verified) {
        console.log('Código verificado exitosamente, llamando a onVerificationSuccess');
        onVerificationSuccess?.();
      } else {
        setError('Código inválido. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      setError('Error al verificar el código. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="verification-modal"
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
            Verificación
          </h1>
          <p className="text-gray-700">
            Para continuar, solicita un código de verificación y luego ingrésalo aquí.
          </p>
        </Box>

        {codeSent && (
          <Box sx={{ textAlign: 'center', mb: 3, color: '#059669' }}>
            ¡Código enviado!
          </Box>
        )}

        {requestError && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: '#fee2e2', 
            border: '1px solid #ef4444',
            color: '#b91c1c',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {requestError}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Código de verificación"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={!!error}
            helperText={error}
            disabled={isLoading || !codeSent}
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
            inputProps={{
              maxLength: 6,
              style: { 
                textAlign: 'center', 
                letterSpacing: '0.5em', 
                fontSize: '1.2em',
                fontFamily: 'Montserrat, sans-serif'
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={requestVerificationCode}
              disabled={requestingCode || codeSent}
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
              {requestingCode ? 'Enviando código...' : 'Solicitar Código'}
            </Button>
            <Button
              variant="contained"
              onClick={handleVerification}
              disabled={isLoading || code.length !== 6 || !codeSent}
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
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default VerificationAlert; 