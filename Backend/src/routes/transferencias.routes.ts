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

// Middleware de validación para crear/actualizar transferencia
const transferenciaValidation = [
  body('billetera_origen').notEmpty().withMessage('La billetera de origen es requerida'),
  body('billetera_destino').notEmpty().withMessage('La billetera de destino es requerida'),
  body('monto').isNumeric().withMessage('El monto debe ser un número'),
  body('fecha').isDate().withMessage('La fecha debe ser válida'),
];

// Obtener todas las transferencias del usuario
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

    // Obtener las transferencias del usuario con información de las billeteras
    const { data: transferencias, error } = await supabaseAdmin
      .from('transferencias')
      .select(`
        *,
        billetera_origen:billetera_origen_id (nombre),
        billetera_destino:billetera_destino_id (nombre)
      `)
      .eq('usuario_id', userData.id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener transferencias:', error);
      res.status(500).json({ message: 'Error al obtener las transferencias', error: error.message });
      return;
    }

    res.status(200).json(transferencias);
  } catch (error: unknown) {
    console.error('Error general al obtener transferencias:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las transferencias', error: errorMessage });
  }
});

// Crear una nueva transferencia
router.post('/', transferenciaValidation, async (req: Request, res: Response): Promise<void> => {
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

    const { billetera_origen, billetera_destino, monto, fecha, email } = req.body;

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

    // Buscar la billetera de origen por nombre
    const { data: billeteraOrigen, error: billeteraOrigenError } = await supabaseAdmin
      .from('billeteras')
      .select('id, saldo')
      .eq('nombre', billetera_origen)
      .eq('usuario_id', userData.id)
      .single();

    if (billeteraOrigenError || !billeteraOrigen) {
      console.error('Error al buscar billetera origen:', billeteraOrigenError);
      res.status(404).json({ message: 'Billetera de origen no encontrada' });
      return;
    }

    // Buscar la billetera de destino por nombre
    const { data: billeteraDestino, error: billeteraDestinoError } = await supabaseAdmin
      .from('billeteras')
      .select('id, saldo')
      .eq('nombre', billetera_destino)
      .eq('usuario_id', userData.id)
      .single();

    if (billeteraDestinoError || !billeteraDestino) {
      console.error('Error al buscar billetera destino:', billeteraDestinoError);
      res.status(404).json({ message: 'Billetera de destino no encontrada' });
      return;
    }

    // Verificar que hay suficiente saldo en la billetera de origen
    if (billeteraOrigen.saldo < monto) {
      res.status(400).json({ message: 'Saldo insuficiente en la billetera de origen' });
      return;
    }

    // Iniciar transacción
    const { data: transferencia, error: transferenciaError } = await supabaseAdmin
      .from('transferencias')
      .insert([{
        usuario_id: userData.id,
        billetera_origen_id: billeteraOrigen.id,
        billetera_destino_id: billeteraDestino.id,
        monto,
        fecha,
        descripcion: null
      }])
      .select()
      .single();

    if (transferenciaError) {
      console.error('Error al crear transferencia:', transferenciaError);
      res.status(500).json({ message: 'Error al crear la transferencia', error: transferenciaError.message });
      return;
    }

    // Actualizar saldos de las billeteras
    const { error: updateOrigenError } = await supabaseAdmin
      .from('billeteras')
      .update({ saldo: billeteraOrigen.saldo - monto })
      .eq('id', billeteraOrigen.id);

    if (updateOrigenError) {
      console.error('Error al actualizar saldo de origen:', updateOrigenError);
      res.status(500).json({ message: 'Error al actualizar saldo de origen', error: updateOrigenError.message });
      return;
    }

    const { error: updateDestinoError } = await supabaseAdmin
      .from('billeteras')
      .update({ saldo: billeteraDestino.saldo + monto })
      .eq('id', billeteraDestino.id);

    if (updateDestinoError) {
      console.error('Error al actualizar saldo de destino:', updateDestinoError);
      res.status(500).json({ message: 'Error al actualizar saldo de destino', error: updateDestinoError.message });
      return;
    }

    res.status(201).json(transferencia);
  } catch (error: unknown) {
    console.error('Error general al crear transferencia:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la transferencia', error: errorMessage });
  }
});

// Eliminar una transferencia
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

    // Verificar que la transferencia pertenece al usuario
    const { data: transferenciaExistente, error: transferenciaError } = await supabaseAdmin
      .from('transferencias')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (transferenciaError || !transferenciaExistente) {
      console.error('Error al verificar transferencia:', transferenciaError);
      res.status(404).json({ message: 'Transferencia no encontrada' });
      return;
    }

    // Eliminar la transferencia
    const { error: deleteError } = await supabaseAdmin
      .from('transferencias')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar transferencia:', deleteError);
      res.status(500).json({ message: 'Error al eliminar la transferencia', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Transferencia eliminada exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar transferencia:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la transferencia', error: errorMessage });
  }
});

export default router;
