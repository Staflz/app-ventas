import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase as supabaseAdmin } from '../supabaseClient';

const router = Router();

// Middleware de validación para solicitar reseteo
const requestResetValidation = [
  body('email').isEmail().withMessage('Email inválido'),
];

// Middleware de validación para actualizar contraseña
const updatePasswordValidation = [
  body('token_hash').notEmpty().withMessage('Token hash es requerido'),
  body('type').notEmpty().withMessage('Tipo de token es requerido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Ruta para solicitar reseteo de contraseña
router.post('/reset-password', requestResetValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    // Usar el cliente admin para enviar el email de reseteo
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) {
      console.error('Error al enviar email de reseteo:', error);
      res.status(500).json({ 
        message: 'Error al enviar email de reseteo',
        error: error.message 
      });
      return;
    }

    res.status(200).json({ 
      message: 'Email de reseteo enviado exitosamente'
    });

  } catch (error: unknown) {
    console.error('Error general al solicitar reseteo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ 
      message: 'Error al solicitar reseteo de contraseña',
      error: errorMessage 
    });
  }
});

// Ruta para actualizar la contraseña
router.post('/update-password', updatePasswordValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token_hash, type, password } = req.body;
    console.log('[reset.routes] Recibido token_hash:', token_hash, 'type:', type);

    if (type !== 'recovery') {
      res.status(400).json({ message: 'Tipo de token inválido para reseteo de contraseña' });
      return;
    }

    // Verificar el token usando el cliente admin
    console.log('[reset.routes] Verificando token con supabase...');
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash,
      type: 'recovery',
    });
    if (verifyError || !user) {
      console.error('[reset.routes] Error al verificar token:', verifyError);
      res.status(400).json({ 
        message: 'Token inválido o expirado',
        error: verifyError?.message 
      });
      return;
    }
    console.log('[reset.routes] Token verificado correctamente. User:', user.id);

    // Actualizar la contraseña usando el cliente admin
    console.log('[reset.routes] Intentando actualizar la contraseña para el usuario:', user.id);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );
    if (updateError) {
      console.error('[reset.routes] Error al actualizar contraseña:', updateError);
      res.status(500).json({ 
        message: 'Error al actualizar la contraseña',
        error: updateError.message 
      });
      return;
    }
    console.log('[reset.routes] Contraseña actualizada exitosamente para el usuario:', user.id);

    res.status(200).json({ 
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error: unknown) {
    console.error('[reset.routes] Error general al actualizar contraseña:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ 
      message: 'Error al actualizar la contraseña',
      error: errorMessage 
    });
  }
});

export default router; 