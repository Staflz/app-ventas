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
  const [requestingCode, setRequestingCode] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  // Función para solicitar/generar el código de verificación
  const requestVerificationCode = async () => {
    setRequestingCode(true);
    setRequestError(null);
    setCodeSent(false);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/request-verification-code', { email });
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
      const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
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
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert severity="info" onClose={onClose}>
        <AlertTitle>Verificación de Código</AlertTitle>
        <div>Para continuar, solicita un código de verificación y luego ingrésalo aquí.</div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button
            variant="contained"
            onClick={requestVerificationCode}
            disabled={requestingCode}
          >
            {requestingCode ? <CircularProgress size={20} color="inherit" /> : 'Solicitar Código'}
          </Button>
          {codeSent && <span style={{ color: 'green' }}>¡Código enviado!</span>}
        </div>
        {requestError && (
          <Box sx={{ mt: 2, color: 'red', textAlign: 'center' }}>{requestError}</Box>
        )}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Código de verificación"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={!!error}
            helperText={error}
            disabled={isLoading || !codeSent}
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }
            }}
          />
          <Button
            variant="contained"
            onClick={handleVerification}
            disabled={isLoading || code.length !== 6 || !codeSent}
            sx={{ mt: 1 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verificar Código'}
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default VerificationAlert; 