import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';

const router = Router();

// Ruta de prueba para el servicio de correo
router.post('/test-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ message: 'Se requiere un correo electrónico' });
      return;
    }

    const testCode = generateVerificationCode();
    console.log('Código generado:', testCode); // Para verificar en la consola

    const emailSent = await sendVerificationEmail(email, testCode);

    if (emailSent) {
      res.status(200).json({
        message: 'Correo de prueba enviado exitosamente',
        code: testCode // Solo para pruebas, en producción no enviaríamos el código
      });
    } else {
      res.status(500).json({
        message: 'Error al enviar el correo de prueba'
      });
    }
  } catch (error: unknown) {
    console.error('Error en la prueba de correo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error en la prueba de correo',
      error: errorMessage
    });
  }
});

// Middleware de validación para el registro
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().withMessage('El nombre es requerido'),
];

// Ruta de registro
router.post('/register', registerValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar los datos recibidos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name } = req.body;

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Intentar registrar el usuario en Supabase
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          verification_code: verificationCode,
          is_verified: false
        }
      }
    });

    if (signUpError) {
      res.status(400).json({
        message: 'Error al registrar el usuario',
        error: signUpError.message
      });
      return;
    }

    // Enviar correo de verificación
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // Si falla el envío del correo, eliminar el usuario de Supabase
      await supabase.auth.admin.deleteUser(userData.user?.id || '');
      res.status(500).json({
        message: 'Error al enviar el correo de verificación'
      });
      return;
    }

    // Si todo sale bien, responder con éxito
    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.',
      success: true
    });

  } catch (error: unknown) {
    console.error('Error en el registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: errorMessage
    });
  }
});

export default router; 