import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, Box, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

interface VerificationAlertProps {
  email: string;
  onClose?: () => void;
  onVerificationSuccess?: () => void;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({ 
  email, 
  onClose,
  onVerificationSuccess 
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingCode, setRequestingCode] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    // Solicitar/generar el código de verificación al montar el componente
    const requestVerificationCode = async () => {
      setRequestingCode(true);
      setRequestError(null);
      try {
        await axios.post('http://localhost:3000/api/auth/request-verification-code', { email });
      } catch (err) {
        setRequestError('No se pudo enviar el código de verificación. Intenta más tarde.');
      } finally {
        setRequestingCode(false);
      }
    };
    requestVerificationCode();
  }, [email]);

  const handleVerification = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
        email,
        code
      });

      if (response.data.verified) {
        onVerificationSuccess?.();
      } else {
        setError('Código inválido. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      setError('Error al verificar el código. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert severity="info" onClose={onClose}>
        <AlertTitle>Verificación de Código</AlertTitle>
        Se ha enviado un código de verificación a <strong>{email}</strong>. 
        Por favor, revisa tu correo electrónico e ingresa el código para continuar.
        {requestingCode && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
            <span style={{ marginLeft: 10 }}>Enviando código...</span>
          </Box>
        )}
        {requestError && (
          <Box sx={{ mt: 2, color: 'red', textAlign: 'center' }}>{requestError}</Box>
        )}
        {!requestingCode && !requestError && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Código de verificación"
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={!!error}
              helperText={error}
              disabled={isLoading}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }
              }}
            />
            <Button
              variant="contained"
              onClick={handleVerification}
              disabled={isLoading || code.length !== 6}
              sx={{ mt: 1 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Verificar Código'
              )}
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default VerificationAlert; 