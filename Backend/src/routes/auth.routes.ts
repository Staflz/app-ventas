import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';

const router = Router();

// Middleware de validación para el registro
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().withMessage('El nombre es requerido'),
];

// Middleware de validación para la verificación
const verificationValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
];

// Middleware de validación para solicitar código de verificación
const requestCodeValidation = [
  body('email').isEmail().withMessage('Email inválido'),
];

// Ruta para solicitar/generar código de verificación
router.post('/request-verification-code', requestCodeValidation, async (req: Request, res: Response): Promise<void> => {
  console.log('Se llamó a /request-verification-code con:', req.body.email);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;
    console.log('Buscando usuario con email:', email);

    // Buscar el usuario directamente en la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, nombre')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error detallado al buscar usuario:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      res.status(500).json({ message: 'Error al buscar el usuario', error: userError.message });
      return;
    }

    if (!userData) {
      console.log('Usuario no encontrado:', email);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    console.log('Usuario encontrado:', userData);

    // Generar código y expiración
    let verificationCode;
    try {
      verificationCode = generateVerificationCode();
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Código de verificación inválido');
      }
      console.log('Código generado:', verificationCode);
    } catch (error) {
      console.error('Error al generar código de verificación:', error);
      res.status(500).json({ message: 'Error al generar código de verificación' });
      return;
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos
    console.log('Fecha de expiración:', expiresAt);

    // Actualizar la tabla usuarios con el código y expiración
    const updateData = {
      codigo_2fa: verificationCode,
      codigo_2fa_expires_at: expiresAt,
      is_2fa_enabled: false
    };
    console.log('Intentando actualizar usuario con datos:', updateData);

    const { error: updateError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error detallado al actualizar usuario:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      res.status(500).json({ 
        message: 'Error al actualizar el usuario', 
        error: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return;
    }

    console.log('Usuario actualizado exitosamente');

    // Enviar el correo
    try {
      console.log('Intentando enviar correo a:', email);
      const emailSent = await sendVerificationEmail(email, verificationCode);
      if (!emailSent) {
        console.error('Error al enviar correo: emailSent es false');
        res.status(500).json({ message: 'Error al enviar el correo de verificación' });
        return;
      }
      console.log('Correo enviado exitosamente a:', email);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      res.status(500).json({ message: 'Error al enviar el correo de verificación' });
      return;
    }

    res.status(200).json({ message: 'Código de verificación enviado exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al solicitar código de verificación:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al solicitar código de verificación', error: errorMessage });
  }
});

// Ruta de verificación de código
router.post('/verify-code', verificationValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar los datos recibidos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, code } = req.body;

    // Buscar el usuario en la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, codigo_2fa, codigo_2fa_expires_at')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error al buscar usuario:', userError);
      res.status(500).json({
        message: 'Error al buscar el usuario',
        error: userError.message,
        verified: false
      });
      return;
    }

    if (!userData) {
      console.log('Usuario no encontrado:', email);
      res.status(404).json({
        message: 'Usuario no encontrado',
        verified: false
      });
      return;
    }

    // Verificar si el código ha expirado
    const now = new Date();
    const expiresAt = new Date(userData.codigo_2fa_expires_at);
    if (now > expiresAt) {
      console.log('Código expirado para usuario:', email);
      res.status(400).json({
        message: 'El código de verificación ha expirado',
        verified: false
      });
      return;
    }

    // Verificar el código
    const isVerified = userData.codigo_2fa === code;

    if (isVerified) {
      // Actualizar el estado de verificación del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          codigo_2fa: null,
          codigo_2fa_expires_at: null
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error al actualizar usuario:', updateError);
        res.status(500).json({
          message: 'Error al actualizar el estado de verificación',
          error: updateError.message,
          verified: false
        });
        return;
      }
    }

    res.status(200).json({
      message: isVerified ? 'Código verificado exitosamente' : 'Código inválido',
      verified: isVerified
    });

  } catch (error: unknown) {
    console.error('Error en la verificación:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error al verificar el código',
      error: errorMessage,
      verified: false
    });
  }
});

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
    console.log('Iniciando registro para:', { email, name });

    // Crear usuario en Supabase Auth
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    const userId = userData.user?.id;
    if (signUpError || !userId) {
      console.error('Error en signUp:', signUpError);
      res.status(400).json({
        message: 'Error al registrar el usuario',
        error: signUpError?.message || 'No se pudo obtener el ID del usuario'
      });
      return;
    }

    console.log('Usuario creado en Auth con ID:', userId);

    // Insertar en la tabla usuarios
    const userToInsert = {
      id: userId,
      nombre: name,
      email: email,
      rol: 'administrador',
      codigo_2fa: null,
      codigo_2fa_expires_at: null
    };
    
    console.log('Intentando insertar usuario en tabla usuarios:', userToInsert);
    
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert([userToInsert]);

    if (insertError) {
      console.error('Error detallado en inserción:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // Si falla la inserción, eliminar el usuario de auth
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log('Usuario eliminado de auth después del error de inserción');
      } catch (deleteError) {
        console.error('Error al eliminar usuario de auth:', deleteError);
      }
      
      res.status(500).json({
        message: 'Error al guardar los datos adicionales del usuario',
        error: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return;
    }

    console.log('Usuario insertado exitosamente en tabla usuarios');

    // Responder con éxito
    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor, revisa tu correo para confirmar tu cuenta.',
      success: true
    });

  } catch (error: unknown) {
    console.error('Error general en el registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: errorMessage
    });
  }
});

// INICIO CAMBIOS LOGIN
// Ruta de login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Usar el método signInWithPassword de Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      res.status(401).json({
        message: 'Credenciales inválidas',
        error: error.message
      });
      return;
    }

    // Obtener información adicional del usuario desde la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      res.status(500).json({
        message: 'Error al obtener información del usuario',
        error: userError.message
      });
      return;
    }

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        ...data.user,
        ...userData
      },
      session: data.session
    });

  } catch (error: unknown) {
    console.error('Error en el login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: errorMessage
    });
  }
});
// FIN CAMBIOS LOGIN

export default router; 