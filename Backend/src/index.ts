import express, { Request, Response, NextFunction } from 'express';
import { supabase } from './supabaseClient';

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


