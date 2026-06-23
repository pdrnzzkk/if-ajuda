/* Grupo de Informática - IFSULDEMINAS Campus Pouso Alegre (2026)
   IF-Ajuda - authRoutes.js
*/
import express from 'express';
import { registrar, login } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/registrar
router.post('/registrar', async (req, res) => {
  try {
    await registrar(req, res);
  } catch (err) {
    console.error('[POST /auth/registrar] Erro não tratado:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    await login(req, res);
  } catch (err) {
    console.error('[POST /auth/login] Erro não tratado:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
});

export default router;
