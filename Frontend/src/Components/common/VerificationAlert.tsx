import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface VerificationAlertProps {
  email: string;
  onClose?: () => void;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({ email, onClose }) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Alert severity="info" onClose={onClose}>
        <AlertTitle>Verificación de Código</AlertTitle>
        Se ha enviado un código de verificación a <strong>{email}</strong>. 
        Por favor, revisa tu correo electrónico e ingresa el código para continuar.
      </Alert>
    </Box>
  );
};

export default VerificationAlert; 