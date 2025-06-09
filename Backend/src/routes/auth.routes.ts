import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Configuración de Supabase Admin (con permisos elevados)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
    console.log('Intentando actualizar usuario con datos:', {
      userId: userData.id,
      updateData: updateData
    });

    // Primero verificar si el usuario existe y obtener su estado actual
    const { data: currentUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id, codigo_2fa, codigo_2fa_expires_at, is_2fa_enabled')
      .eq('id', userData.id)
      .single();

    if (checkError) {
      console.error('Error al verificar usuario antes de actualizar:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details
      });
      res.status(500).json({ 
        message: 'Error al verificar el usuario', 
        error: checkError.message 
      });
      return;
    }

    console.log('Estado actual del usuario:', currentUser);

    // Intentar la actualización
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        codigo_2fa: verificationCode,
        codigo_2fa_expires_at: expiresAt,
        is_2fa_enabled: false
      })
      .eq('id', userData.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('Error detallado al actualizar usuario:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        userId: userData.id,
        attemptedUpdate: updateData
      });
      res.status(500).json({ 
        message: 'Error al actualizar el usuario', 
        error: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return;
    }

    if (!updatedUser) {
      console.error('No se pudo actualizar el usuario - no se encontró después de la actualización:', {
        userId: userData.id,
        attemptedUpdate: updateData
      });
      res.status(500).json({ 
        message: 'Error: No se pudo actualizar el usuario',
        error: 'Usuario no encontrado después de la actualización'
      });
      return;
    }

    console.log('Usuario actualizado exitosamente:', {
      id: updatedUser.id,
      codigo_2fa: updatedUser.codigo_2fa,
      codigo_2fa_expires_at: updatedUser.codigo_2fa_expires_at,
      is_2fa_enabled: updatedUser.is_2fa_enabled
    });

    // Verificar que la actualización fue exitosa
    if (updatedUser.codigo_2fa !== verificationCode) {
      console.error('La actualización no se realizó correctamente:', {
        expectedCode: verificationCode,
        actualCode: updatedUser.codigo_2fa
      });
      res.status(500).json({ 
        message: 'Error: La actualización no se realizó correctamente',
        error: 'Verificación de actualización fallida'
      });
      return;
    }

    // Enviar el correo
    try {
      console.log('Intentando enviar correo a:', email);
      const emailSent = await sendVerificationEmail(email, verificationCode);
      if (!emailSent) {
        // Si falla el envío del correo, revertir la actualización
        console.error('Error al enviar correo, intentando revertir actualización');
        const { error: revertError } = await supabase
          .from('usuarios')
          .update({
            codigo_2fa: null,
            codigo_2fa_expires_at: null,
            is_2fa_enabled: false
          })
          .eq('id', userData.id);

        if (revertError) {
          console.error('Error al revertir actualización:', revertError);
        }

        res.status(500).json({ message: 'Error al enviar el correo de verificación' });
        return;
      }
      console.log('Correo enviado exitosamente a:', email);
    } catch (error) {
      // Si falla el envío del correo, revertir la actualización
      console.error('Error al enviar correo, intentando revertir actualización:', error);
      const { error: revertError } = await supabase
        .from('usuarios')
        .update({
          codigo_2fa: null,
          codigo_2fa_expires_at: null,
          is_2fa_enabled: false
        })
        .eq('id', userData.id);

      if (revertError) {
        console.error('Error al revertir actualización:', revertError);
      }

      res.status(500).json({ message: 'Error al enviar el correo de verificación' });
      return;
    }

    res.status(200).json({ 
      message: 'Código de verificación enviado exitosamente',
      verificationCode: verificationCode // Solo para debugging
    });

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
    console.log('Verificando código para:', email);

    // Buscar el usuario en la tabla usuarios usando el cliente admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, codigo_2fa, codigo_2fa_expires_at')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error al buscar usuario:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
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

    console.log('Usuario encontrado:', {
      id: userData.id,
      email: email,
      codigo_2fa: userData.codigo_2fa,
      codigo_2fa_expires_at: userData.codigo_2fa_expires_at
    });

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
    console.log('Verificación de código:', {
      codigoRecibido: code,
      codigoAlmacenado: userData.codigo_2fa,
      esValido: isVerified
    });

    if (isVerified) {
      // Actualizar el estado de verificación del usuario usando el cliente admin
      const { error: updateError } = await supabaseAdmin
        .from('usuarios')
        .update({
          codigo_2fa: null,
          codigo_2fa_expires_at: null
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error al actualizar usuario:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        res.status(500).json({
          message: 'Error al actualizar el estado de verificación',
          error: updateError.message,
          verified: false
        });
        return;
      }

      console.log('Usuario actualizado exitosamente después de verificación');
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

// Ruta de login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Intento de login para:', email);

    // Usar el método signInWithPassword de Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error en autenticación:', {
        code: error.code,
        message: error.message,
        status: error.status
      });
      res.status(401).json({
        message: 'Credenciales inválidas',
        error: error.message
      });
      return;
    }

    console.log('Autenticación exitosa, ID del usuario:', data.user.id);

    // Obtener información adicional del usuario desde la tabla usuarios usando el cliente admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Error al obtener información del usuario:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        userId: data.user.id
      });
      res.status(500).json({
        message: 'Error al obtener información del usuario',
        error: userError.message,
        details: userError.details
      });
      return;
    }

    if (!userData) {
      console.error('Usuario no encontrado en la tabla usuarios:', data.user.id);
      res.status(404).json({
        message: 'Usuario no encontrado en la base de datos',
        error: 'El usuario existe en auth pero no en la tabla usuarios'
      });
      return;
    }

    console.log('Información del usuario obtenida exitosamente:', {
      id: userData.id,
      email: userData.email,
      nombre: userData.nombre
    });

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        ...data.user,
        ...userData
      },
      session: data.session
    });

  } catch (error: unknown) {
    console.error('Error general en el login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: errorMessage
    });
  }
});

export default router; 