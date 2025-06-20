import express, { Request, Response, NextFunction } from 'express';
import { supabase } from './supabaseClient';
//
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import ventasRoutes from './routes/ventas.routes';
import transaccionesRoutes from './routes/transacciones.routes';
import resetRoutes from './routes/reset.routes';
import billeterasRoutes from './routes/billeteras.routes';
import transferenciasRoutes from './routes/transferencias.routes';
import inventariosRoutes from './routes/inventarios.routes';
import movimientosRoutes from './routes/movimientos.routes';
import viewRoutes from './routes/view.routes';
//

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://app-ventas-1.vercel.app'],
  credentials: true
}));
app.use(express.json());
//

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

app.get('/check-supabase', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('usuarios') // Cambia 'usuarios' por una tabla que tengas en Supabase
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error conectando a Supabase:', error);
    return res.status(500).json({ message: 'Error conectando a Supabase', error });
  }

  res.json({ message: 'Conexión a Supabase OK', data });
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/auth', resetRoutes); // Montar las rutas de reset bajo /api/auth
app.use('/api/billeteras', billeterasRoutes);
app.use('/api/transferencias', transferenciasRoutes);
app.use('/api/productos', inventariosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/view', viewRoutes);
//

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


