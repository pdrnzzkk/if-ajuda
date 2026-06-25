/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/config/multer.js
 * Configura os uploaders Multer usados no projeto:
 *   - uploadQuestao    → aceita apenas .pdf  (banco de questões)
 *   - uploadFotoPerfil → aceita imagens comuns (foto de perfil)
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Pasta temporária — Sharp move o arquivo depois para /public/uploads
// ---------------------------------------------------------------------------
const TEMP_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Storage: disco temporário
// ---------------------------------------------------------------------------
const diskStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, TEMP_DIR);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

// ---------------------------------------------------------------------------
// Filtro exclusivo para PDFs — rotas do banco de questões
// ---------------------------------------------------------------------------
const pdfFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(
      Object.assign(new Error(`Apenas arquivos .pdf são permitidos. Recebido: ${ext || 'sem extensão'}`), { code: 'LIMIT_UNEXPECTED_FILE' })
    );
  }
  cb(null, true);
};

// ---------------------------------------------------------------------------
// Filtro para fotos de perfil — aceita imagens comuns
// ---------------------------------------------------------------------------
const imageFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`Tipo de imagem não suportado: ${file.mimetype}`));
  }
  cb(null, true);
};

// ---------------------------------------------------------------------------
// Instâncias exportadas
// ---------------------------------------------------------------------------

/** Aceita apenas 1 PDF no campo "arquivo". Limite: 20 MB. */
export const uploadQuestao = multer({
  storage: diskStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single('arquivo');

/** Aceita apenas 1 imagem no campo "foto". Limite: 10 MB. */
export const uploadFotoPerfil = multer({
  storage: diskStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('foto');

export default { uploadQuestao, uploadFotoPerfil };
