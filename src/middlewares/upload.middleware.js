/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/middlewares/upload.middleware.js
 * Configura o Multer para receber uploads (ex: imagens de questões ou
 * materiais de monitoria) em memória, limitando tamanho e tipos de arquivo.
 */

import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado.'), false);
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export default upload;
