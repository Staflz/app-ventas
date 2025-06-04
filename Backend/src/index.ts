import express, { Request, Response, NextFunction } from 'express';
import { supabase } from './supabaseClient';
//
import cors from 'cors';
import authRoutes from './routes/auth.routes';
//

const app = express();

// Middleware
app.use(cors({
  //process.env.FRONTEND_URL"
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Permite origen dinámico
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
//

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


