import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
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

// Middleware de validación para crear/actualizar billetera
const billeteraValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('saldo').optional().isNumeric().withMessage('El saldo debe ser un número'),
];

// Obtener todas las billeteras del usuario
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ message: 'Se requiere el email del usuario' });
      return;
    }

    // Buscar el usuario por email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Obtener las billeteras del usuario
    const { data: billeteras, error } = await supabaseAdmin
      .from('billeteras')
      .select('*')
      .eq('usuario_id', userData.id)
      .order('ultima_actualizacion', { ascending: false });

    if (error) {
      console.error('Error al obtener billeteras:', error);
      res.status(500).json({ message: 'Error al obtener las billeteras', error: error.message });
      return;
    }

    res.status(200).json(billeteras);
  } catch (error: unknown) {
    console.error('Error general al obtener billeteras:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las billeteras', error: errorMessage });
  }
});

// Crear una nueva billetera
router.post('/', billeteraValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Errores de validación:', errors.array());
      res.status(400).json({ 
        message: 'Error de validación',
        errors: errors.array() 
      });
      return;
    }

    const { nombre, saldo, email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Se requiere el email del usuario' });
      return;
    }

    // Buscar el usuario por email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const nuevaBilletera = {
      nombre,
      saldo: saldo || 0,
      usuario_id: userData.id,
      ultima_actualizacion: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('billeteras')
      .insert([nuevaBilletera])
      .select()
      .single();

    if (error) {
      console.error('Error al crear billetera:', error);
      res.status(500).json({ message: 'Error al crear la billetera', error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error: unknown) {
    console.error('Error general al crear billetera:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la billetera', error: errorMessage });
  }
});

// Actualizar una billetera
router.put('/:id', billeteraValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Errores de validación:', errors.array());
      res.status(400).json({ 
        message: 'Error de validación',
        errors: errors.array() 
      });
      return;
    }

    const { id } = req.params;
    const { nombre, saldo, email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Se requiere el email del usuario' });
      return;
    }

    // Buscar el usuario por email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Verificar que la billetera pertenece al usuario
    const { data: billeteraExistente, error: billeteraError } = await supabaseAdmin
      .from('billeteras')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (billeteraError || !billeteraExistente) {
      console.error('Error al verificar billetera:', billeteraError);
      res.status(404).json({ message: 'Billetera no encontrada' });
      return;
    }

    const billeteraActualizada = {
      nombre: nombre || billeteraExistente.nombre,
      saldo: saldo !== undefined ? saldo : billeteraExistente.saldo,
      ultima_actualizacion: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('billeteras')
      .update(billeteraActualizada)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar billetera:', error);
      res.status(500).json({ message: 'Error al actualizar la billetera', error: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error general al actualizar billetera:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la billetera', error: errorMessage });
  }
});

// Eliminar una billetera
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!email) {
      res.status(400).json({ message: 'Se requiere el email del usuario' });
      return;
    }

    // Buscar el usuario por email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario:', userError);
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Verificar que la billetera pertenece al usuario
    const { data: billeteraExistente, error: billeteraError } = await supabaseAdmin
      .from('billeteras')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (billeteraError || !billeteraExistente) {
      console.error('Error al verificar billetera:', billeteraError);
      res.status(404).json({ message: 'Billetera no encontrada' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('billeteras')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar billetera:', error);
      res.status(500).json({ message: 'Error al eliminar la billetera', error: error.message });
      return;
    }

    res.status(200).json({ message: 'Billetera eliminada exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar billetera:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la billetera', error: errorMessage });
  }
});

export default router;
