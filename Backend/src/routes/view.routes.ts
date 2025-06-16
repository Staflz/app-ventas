import { Router } from 'express';
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

// Obtener el balance total de las billeteras del usuario
router.get('/balance-total', async (req: Request, res: Response): Promise<void> => {
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

    // Obtener todas las billeteras del usuario y sumar sus saldos
    const { data: billeteras, error } = await supabaseAdmin
      .from('billeteras')
      .select('saldo')
      .eq('usuario_id', userData.id);

    if (error) {
      console.error('Error al obtener billeteras:', error);
      res.status(500).json({ message: 'Error al obtener el balance total', error: error.message });
      return;
    }

    // Calcular el balance total sumando todos los saldos
    const balanceTotal = billeteras.reduce((total, billetera) => total + (billetera.saldo || 0), 0);

    res.status(200).json({ balanceTotal });
  } catch (error: unknown) {
    console.error('Error general al obtener balance total:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al obtener el balance total', error: errorMessage });
  }
});

export default router;
