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

// Middleware de validación para crear transacción
const createTransaccionValidation = [
  body('categoria').notEmpty().withMessage('La categoría es requerida'),
  body('monto').isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('tipo').isIn(['ingreso', 'gasto']).withMessage('El tipo debe ser ingreso o gasto'),
  body('fecha').isDate().withMessage('La fecha debe ser válida'),
];

// Obtener todas las transacciones
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: transacciones, error } = await supabaseAdmin
      .from('transacciones')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener transacciones:', error);
      res.status(500).json({ message: 'Error al obtener las transacciones', error: error.message });
      return;
    }

    res.status(200).json(transacciones);
  } catch (error: unknown) {
    console.error('Error general al obtener transacciones:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las transacciones', error: errorMessage });
  }
});

// Crear una nueva transacción
router.post('/', createTransaccionValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { categoria, monto, tipo, fecha, email } = req.body;

    // Asegurarnos de que el tipo sea exactamente "ingreso" o "gasto"
    if (tipo !== 'ingreso' && tipo !== 'gasto') {
      res.status(400).json({ message: 'El tipo debe ser exactamente "ingreso" o "gasto"' });
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

    const { data: transaccion, error } = await supabaseAdmin
      .from('transacciones')
      .insert([
        {
          usuario_id: userData.id,
          categoria,
          monto,
          tipo: tipo as 'ingreso' | 'gasto', // Aseguramos el tipo
          fecha,
          descripcion: null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al crear transacción:', error);
      res.status(500).json({ message: 'Error al crear la transacción', error: error.message });
      return;
    }

    res.status(201).json(transaccion);
  } catch (error: unknown) {
    console.error('Error general al crear transacción:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la transacción', error: errorMessage });
  }
});

// Eliminar una transacción
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar si la transacción existe
    const { data: transaccionExistente, error: checkError } = await supabaseAdmin
      .from('transacciones')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error al verificar transacción:', checkError);
      res.status(500).json({ message: 'Error al verificar la transacción', error: checkError.message });
      return;
    }

    if (!transaccionExistente) {
      res.status(404).json({ message: 'Transacción no encontrada' });
      return;
    }

    // Eliminar la transacción
    const { error: deleteError } = await supabaseAdmin
      .from('transacciones')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar transacción:', deleteError);
      res.status(500).json({ message: 'Error al eliminar la transacción', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Transacción eliminada exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar transacción:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la transacción', error: errorMessage });
  }
});

// Actualizar una transacción
router.put('/:id', createTransaccionValidation, async (req: Request, res: Response): Promise<void> => {
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
    const { categoria, monto, tipo, fecha } = req.body;

    console.log('Intentando actualizar transacción con ID:', id);
    console.log('Datos recibidos:', { categoria, monto, tipo, fecha });

    // Verificar si la transacción existe
    const { data: transaccionExistente, error: checkError } = await supabaseAdmin
      .from('transacciones')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error al verificar transacción:', checkError);
      res.status(500).json({ 
        message: 'Error al verificar la transacción', 
        error: checkError.message,
        details: checkError.details
      });
      return;
    }

    if (!transaccionExistente) {
      console.error('Transacción no encontrada con ID:', id);
      res.status(404).json({ message: 'Transacción no encontrada' });
      return;
    }

    console.log('Transacción encontrada:', transaccionExistente);

    // Actualizar la transacción
    const { data: transaccion, error: updateError } = await supabaseAdmin
      .from('transacciones')
      .update({
        categoria,
        monto: parseFloat(monto),
        tipo,
        fecha
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar transacción:', updateError);
      res.status(500).json({ 
        message: 'Error al actualizar la transacción', 
        error: updateError.message,
        details: updateError.details
      });
      return;
    }

    console.log('Transacción actualizada exitosamente:', transaccion);
    res.status(200).json(transaccion);
  } catch (error: unknown) {
    console.error('Error general al actualizar transacción:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la transacción', error: errorMessage });
  }
});

export default router; 