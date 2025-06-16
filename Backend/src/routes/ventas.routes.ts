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

// Middleware de validación para crear venta
const createVentaValidation = [
  body('producto_alias').notEmpty().withMessage('El producto es requerido'),
  body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número positivo'),
  body('fecha').isDate().withMessage('La fecha debe ser válida'),
  body('hora').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('La hora debe ser válida (HH:MM o HH:MM:SS)'),
];

// Obtener todas las ventas
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: ventas, error } = await supabaseAdmin
      .from('ventas')
      .select(`
        *,
        inventarios:producto_id (
          nombre_producto
        )
      `)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ message: 'Error al obtener las ventas', error: error.message });
      return;
    }

    // Transformar los datos para incluir el nombre_producto directamente
    const ventasFormateadas = ventas.map(venta => ({
      ...venta,
      nombre_producto: venta.inventarios?.nombre_producto || 'Producto no encontrado'
    }));

    res.status(200).json(ventasFormateadas);
  } catch (error: unknown) {
    console.error('Error general al obtener ventas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener las ventas', error: errorMessage });
  }
});

// Crear una nueva venta
router.post('/', createVentaValidation, async (req: Request, res: Response): Promise<void> => {
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

    console.log('Datos recibidos:', req.body);
    const { producto_alias, cantidad, fecha, hora, email } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!producto_alias || !cantidad || !fecha || !hora || !email) {
      console.error('Faltan campos requeridos:', { producto_alias, cantidad, fecha, hora, email });
      res.status(400).json({ 
        message: 'Faltan campos requeridos',
        received: { producto_alias, cantidad, fecha, hora, email }
      });
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

    // Buscar el producto en el inventario por su alias
    const { data: productoData, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('id, precio_unitario')
      .eq('alias', producto_alias)
      .single();

    if (productoError || !productoData) {
      console.error('Error al buscar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Calcular el total usando el precio unitario del producto
    const total = cantidad * productoData.precio_unitario;

    const { data: venta, error } = await supabaseAdmin
      .from('ventas')
      .insert([
        {
          usuario_id: userData.id,
          producto_id: productoData.id,
          producto_alias: producto_alias,
          cantidad,
          total,
          fecha,
          hora
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al crear venta:', error);
      res.status(500).json({ message: 'Error al crear la venta', error: error.message });
      return;
    }

    res.status(201).json(venta);
  } catch (error: unknown) {
    console.error('Error general al crear venta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear la venta', error: errorMessage });
  }
});

// Eliminar una venta
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar si la venta existe
    const { data: ventaExistente, error: checkError } = await supabaseAdmin
      .from('ventas')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error al verificar venta:', checkError);
      res.status(500).json({ message: 'Error al verificar la venta', error: checkError.message });
      return;
    }

    if (!ventaExistente) {
      res.status(404).json({ message: 'Venta no encontrada' });
      return;
    }

    // Eliminar la venta
    const { error: deleteError } = await supabaseAdmin
      .from('ventas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar venta:', deleteError);
      res.status(500).json({ message: 'Error al eliminar la venta', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Venta eliminada exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar venta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar la venta', error: errorMessage });
  }
});

// Actualizar una venta
router.put('/:id', createVentaValidation, async (req: Request, res: Response): Promise<void> => {
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
    const { producto_alias, cantidad, fecha, hora } = req.body;

    console.log('Intentando actualizar venta con ID:', id);
    console.log('Datos recibidos:', { producto_alias, cantidad, fecha, hora });

    // Verificar si la venta existe
    const { data: ventaExistente, error: checkError } = await supabaseAdmin
      .from('ventas')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error al verificar venta:', checkError);
      res.status(500).json({ 
        message: 'Error al verificar la venta', 
        error: checkError.message,
        details: checkError.details
      });
      return;
    }

    if (!ventaExistente) {
      console.error('Venta no encontrada con ID:', id);
      res.status(404).json({ message: 'Venta no encontrada' });
      return;
    }

    // Buscar el producto en el inventario por su alias
    const { data: productoData, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('id, precio_unitario')
      .eq('alias', producto_alias)
      .single();

    if (productoError || !productoData) {
      console.error('Error al buscar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    // Calcular el total usando el precio unitario del producto
    const total = cantidad * productoData.precio_unitario;

    // Actualizar la venta
    const { data: venta, error: updateError } = await supabaseAdmin
      .from('ventas')
      .update({
        producto_id: productoData.id,
        producto_alias: producto_alias,
        cantidad: parseInt(cantidad),
        total,
        fecha,
        hora
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar venta:', updateError);
      res.status(500).json({ 
        message: 'Error al actualizar la venta', 
        error: updateError.message,
        details: updateError.details
      });
      return;
    }

    console.log('Venta actualizada exitosamente:', venta);
    res.status(200).json(venta);
  } catch (error: unknown) {
    console.error('Error general al actualizar venta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar la venta', error: errorMessage });
  }
});

export default router; 