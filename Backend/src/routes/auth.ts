/* import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,  // para que envíe email de confirmación
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data.user });
});

export default router; */