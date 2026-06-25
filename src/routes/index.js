/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/routes/index.js
 * Centraliza todas as rotas da API (auth + questões + foto de perfil).
 */

import { Router } from 'express';
import authRoutes from './authRoutes.js';
import { uploadQuestao, uploadFotoPerfil } from '../config/multer.js';
import { comprimirFotoPerfil } from '../middlewares/sharpMiddleware.js';
import { fazerUploadQuestao, listarQuestoes } from '../controllers/questaoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
router.use('/auth', authRoutes);

// ---------------------------------------------------------------------------
// Banco de Questões
// ---------------------------------------------------------------------------

// POST /api/questoes/upload — só aceita .pdf, requer login
router.post(
  '/questoes/upload',
  verificarToken,
  uploadQuestao,
  fazerUploadQuestao,
);

// GET /api/questoes?id_materia=X&pagina=1&limite=10
router.get('/questoes', listarQuestoes);

// ---------------------------------------------------------------------------
// Foto de Perfil
// ---------------------------------------------------------------------------

// PUT /api/usuarios/:id/foto — Multer → Sharp → resposta
router.put(
  '/usuarios/:id/foto',
  verificarToken,
  uploadFotoPerfil,
  comprimirFotoPerfil,
  (req, res) => {
    // Substitua o handler abaixo por atualizarFotoPerfil quando criar o usuarioController
    res.status(200).json({
      sucesso  : true,
      mensagem : 'Foto atualizada com sucesso.',
      urlFoto  : req.file.urlCurta,
      tamanhoKB: (req.file.size / 1024).toFixed(1),
    });
  },
);

// ---------------------------------------------------------------------------
// Handler de erros de upload (Multer + Sharp)
// ---------------------------------------------------------------------------
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ sucesso: false, mensagem: 'Arquivo muito grande.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(415).json({ sucesso: false, mensagem: err.message });
  }
  if (err.message?.startsWith('Tipo de imagem')) {
    return res.status(415).json({ sucesso: false, mensagem: err.message });
  }
  console.error('[routes/index] Erro não tratado:', err);
  return res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
});

export default router;
