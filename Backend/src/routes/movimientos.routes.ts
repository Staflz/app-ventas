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

// Middleware de validación para crear/actualizar movimiento
const movimientoValidation = [
  body('producto_id').notEmpty().withMessage('El ID del producto es requerido'),
  body('cantidad').isNumeric().withMessage('La cantidad debe ser un número'),
  body('tipo').isIn(['entrada', 'salida']).withMessage('El tipo debe ser entrada o salida'),
  body('fecha').notEmpty().withMessage('La fecha es requerida'),
];

// Obtener todos los movimientos del usuario
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

    // Obtener los movimientos del usuario
    const { data: movimientos, error } = await supabaseAdmin
      .from('movimientos_inventario')
      .select('*')
      .eq('usuario_id', userData.id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener movimientos:', error);
      res.status(500).json({ message: 'Error al obtener los movimientos', error: error.message });
      return;
    }

    res.status(200).json(movimientos);
  } catch (error: unknown) {
    console.error('Error general al obtener movimientos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los movimientos', error: errorMessage });
  }
});

// Crear un nuevo movimiento
router.post('/', movimientoValidation, async (req: Request, res: Response): Promise<void> => {
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

    const { producto_id, cantidad, tipo, fecha, email } = req.body;

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

    // Verificar que el producto existe y pertenece al usuario
    const { data: producto, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('*')
      .eq('id', producto_id)
      .eq('usuario_id', userData.id)
      .single();

    if (productoError || !producto) {
      console.error('Error al verificar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Actualizar el stock del producto
    const nuevoStock = tipo === 'entrada' 
      ? producto.stock + cantidad 
      : producto.stock - cantidad;

    if (nuevoStock < 0) {
      res.status(400).json({ message: 'No hay suficiente stock disponible' });
      return;
    }

    // Crear el movimiento
    const nuevoMovimiento = {
      producto_id,
      cantidad,
      tipo,
      fecha,
      usuario_id: userData.id
    };

    const { data: movimiento, error: movimientoError } = await supabaseAdmin
      .from('movimientos_inventario')
      .insert([nuevoMovimiento])
      .select()
      .single();

    if (movimientoError) {
      console.error('Error al crear movimiento:', movimientoError);
      res.status(500).json({ message: 'Error al crear el movimiento', error: movimientoError.message });
      return;
    }

    // Actualizar el stock del producto
    const { error: updateError } = await supabaseAdmin
      .from('inventarios')
      .update({ stock: nuevoStock })
      .eq('id', producto_id);

    if (updateError) {
      console.error('Error al actualizar stock:', updateError);
      res.status(500).json({ message: 'Error al actualizar el stock', error: updateError.message });
      return;
    }

    res.status(201).json(movimiento);
  } catch (error: unknown) {
    console.error('Error general al crear movimiento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear el movimiento', error: errorMessage });
  }
});

// Actualizar un movimiento
router.put('/:id', movimientoValidation, async (req: Request, res: Response): Promise<void> => {
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
    const { producto_id, cantidad, tipo, fecha, email } = req.body;

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

    // Verificar que el movimiento pertenece al usuario
    const { data: movimientoExistente, error: movimientoError } = await supabaseAdmin
      .from('movimientos_inventario')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (movimientoError || !movimientoExistente) {
      console.error('Error al verificar movimiento:', movimientoError);
      res.status(404).json({ message: 'Movimiento no encontrado' });
      return;
    }

    // Verificar que el producto existe y pertenece al usuario
    const { data: producto, error: productoError } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('id', producto_id)
      .eq('usuario_id', userData.id)
      .single();

    if (productoError || !producto) {
      console.error('Error al verificar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Calcular la diferencia en el stock
    const diferenciaStock = tipo === 'entrada' 
      ? cantidad - movimientoExistente.cantidad
      : movimientoExistente.cantidad - cantidad;

    const nuevoStock = producto.stock + diferenciaStock;

    if (nuevoStock < 0) {
      res.status(400).json({ message: 'No hay suficiente stock disponible' });
      return;
    }

    const movimientoActualizado = {
      producto_id: producto_id || movimientoExistente.producto_id,
      cantidad: cantidad || movimientoExistente.cantidad,
      tipo: tipo || movimientoExistente.tipo,
      fecha: fecha || movimientoExistente.fecha
    };

    const { data, error } = await supabaseAdmin
      .from('movimientos_inventario')
      .update(movimientoActualizado)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar movimiento:', error);
      res.status(500).json({ message: 'Error al actualizar el movimiento', error: error.message });
      return;
    }

    // Actualizar el stock del producto
    const { error: updateError } = await supabaseAdmin
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', producto_id);

    if (updateError) {
      console.error('Error al actualizar stock:', updateError);
      res.status(500).json({ message: 'Error al actualizar el stock', error: updateError.message });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error general al actualizar movimiento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el movimiento', error: errorMessage });
  }
});

// Eliminar un movimiento
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    console.log('Intentando eliminar movimiento:', { id, email });

    if (!email) {
      console.log('Error: Email no proporcionado');
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

    console.log('Usuario encontrado:', userData);

    // Verificar que el movimiento pertenece al usuario
    const { data: movimientoExistente, error: movimientoError } = await supabaseAdmin
      .from('movimientos_inventario')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (movimientoError || !movimientoExistente) {
      console.error('Error al verificar movimiento:', movimientoError);
      res.status(404).json({ message: 'Movimiento no encontrado' });
      return;
    }

    console.log('Movimiento encontrado:', movimientoExistente);

    // Obtener el producto asociado
    const { data: producto, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('*')
      .eq('id', movimientoExistente.producto_id)
      .single();

    if (productoError || !producto) {
      console.error('Error al obtener producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    console.log('Producto encontrado:', producto);

    // Calcular el nuevo stock
    const nuevoStock = movimientoExistente.tipo === 'entrada'
      ? producto.stock - movimientoExistente.cantidad
      : producto.stock + movimientoExistente.cantidad;

    console.log('Cálculo de stock:', {
      stockActual: producto.stock,
      tipoMovimiento: movimientoExistente.tipo,
      cantidad: movimientoExistente.cantidad,
      nuevoStock
    });

    // Verificar que el nuevo stock no sea negativo
    if (nuevoStock < 0) {
      console.log('Error: Stock resultante sería negativo');
      res.status(400).json({ message: 'No se puede eliminar el movimiento: el stock resultante sería negativo' });
      return;
    }

    // Actualizar el stock del producto
    const { error: updateError } = await supabaseAdmin
      .from('inventarios')
      .update({ stock: nuevoStock })
      .eq('id', movimientoExistente.producto_id);

    if (updateError) {
      console.error('Error al actualizar stock:', updateError);
      res.status(500).json({ message: 'Error al actualizar el stock', error: updateError.message });
      return;
    }

    console.log('Stock actualizado exitosamente');

    // Eliminar el movimiento
    const { error } = await supabaseAdmin
      .from('movimientos_inventario')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar movimiento:', error);
      res.status(500).json({ message: 'Error al eliminar el movimiento', error: error.message });
      return;
    }

    console.log('Movimiento eliminado exitosamente');
    res.status(200).json({ message: 'Movimiento eliminado exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar movimiento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar el movimiento', error: errorMessage });
  }
});

export default router;
