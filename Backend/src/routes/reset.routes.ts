import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

// Validación para solicitar reseteo de contraseña
const resetPasswordValidation = [
  body('email').isEmail().withMessage('Email inválido'),
];

// Validación para actualizar contraseña
const updatePasswordValidation = [
  body('token').notEmpty().withMessage('Token es requerido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Endpoint para solicitar el email de recuperación de contraseña
router.post('/api/auth/reset-password', resetPasswordValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.RESET_PASSWORD_REDIRECT_URL || 'http://localhost:5173/reset-password',
    });
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(200).json({ message: 'Enlace de recuperación enviado' });
  } catch (err) {
    console.error('Error en /reset-password:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para actualizar la contraseña usando el token
router.post('/api/auth/update-password', updatePasswordValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { token, password } = req.body;
    // Dependiendo de la versión del SDK de Supabase, el flujo de actualización de contraseña puede variar.
    // Aquí dejamos un error claro para implementar correctamente según la versión:
    res.status(501).json({ message: 'Actualización de contraseña con token no implementada. Consulta la documentación del SDK de Supabase para el método correcto (exchangeCodeForSession o verifyOtp).' });
    return;
    // Ejemplo para Supabase JS v2:
    // const { data, error } = await supabase.auth.exchangeCodeForSession(token);
    // if (error) { ... }
    // Luego, con la sesión activa, puedes actualizar la contraseña.
  } catch (err) {
    console.error('Error en /update-password:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router; 