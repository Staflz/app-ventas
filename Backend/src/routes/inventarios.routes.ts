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

// Middleware de validación para crear/actualizar producto
const productoValidation = [
  body('alias').notEmpty().withMessage('El alias es requerido'),
  body('nombre_producto').notEmpty().withMessage('El nombre del producto es requerido'),
  body('precio_unitario').isNumeric().withMessage('El precio unitario debe ser un número'),
  body('stock').isNumeric().withMessage('El stock debe ser un número'),
];

// Obtener todos los productos del usuario
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

    // Obtener los productos del usuario
    const { data: productos, error } = await supabaseAdmin
      .from('inventarios')
      .select('*')
      .eq('usuario_id', userData.id)
      .order('nombre_producto', { ascending: true });

    if (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
      return;
    }

    res.status(200).json(productos);
  } catch (error: unknown) {
    console.error('Error general al obtener productos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener los productos', error: errorMessage });
  }
});

// Crear un nuevo producto
router.post('/', productoValidation, async (req: Request, res: Response): Promise<void> => {
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

    const { nombre_producto, alias, precio_unitario, stock, email } = req.body;

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

    const nuevoProducto = {
      nombre_producto,
      alias,
      precio_unitario,
      stock,
      usuario_id: userData.id
    };

    const { data, error } = await supabaseAdmin
      .from('inventarios')
      .insert([nuevoProducto])
      .select()
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error al crear el producto', error: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error: unknown) {
    console.error('Error general al crear producto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al crear el producto', error: errorMessage });
  }
});

// Actualizar un producto
router.put('/:id', productoValidation, async (req: Request, res: Response): Promise<void> => {
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
    const { alias, nombre_producto, precio_unitario, stock, email } = req.body;

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

    // Verificar que el producto pertenece al usuario
    const { data: productoExistente, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (productoError || !productoExistente) {
      console.error('Error al verificar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    const productoActualizado = {
      alias: alias || productoExistente.alias,
      nombre_producto: nombre_producto || productoExistente.nombre_producto,
      precio_unitario: precio_unitario !== undefined ? precio_unitario : productoExistente.precio_unitario,
      stock: stock !== undefined ? stock : productoExistente.stock
    };

    const { data, error } = await supabaseAdmin
      .from('inventarios')
      .update(productoActualizado)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Error general al actualizar producto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al actualizar el producto', error: errorMessage });
  }
});

// Eliminar un producto
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

    // Verificar que el producto pertenece al usuario
    const { data: productoExistente, error: productoError } = await supabaseAdmin
      .from('inventarios')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', userData.id)
      .single();

    if (productoError || !productoExistente) {
      console.error('Error al verificar producto:', productoError);
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('inventarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error: unknown) {
    console.error('Error general al eliminar producto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al eliminar el producto', error: errorMessage });
  }
});

export default router;
