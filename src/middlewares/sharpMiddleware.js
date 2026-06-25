/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/middlewares/sharpMiddleware.js
 * Middleware que comprime e converte a foto de perfil para WebP 250×250.
 *
 * Fluxo:
 *   Multer → /uploads/temp.png (5 MB)
 *   Sharp  → resize 250×250 (fit: cover) + webp quality 80
 *          → /public/uploads/xxx-perfil.webp (~15 KB)
 *   fs.unlink → remove o arquivo original pesado
 *   req.file.urlCurta → string salva no banco de dados
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Destino final — pasta pública servida pelo Express
const PUBLIC_UPLOADS = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(PUBLIC_UPLOADS)) fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });

export const comprimirFotoPerfil = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath  = req.file.path;
  const filename   = `${Date.now()}-perfil.webp`;
  const outputPath = path.join(PUBLIC_UPLOADS, filename);

  try {
    await sharp(inputPath)
      .resize(250, 250, { fit: 'cover', withoutEnlargement: false })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Remove o arquivo original pesado
    fs.unlink(inputPath, (err) => {
      if (err) console.warn('[sharp] Não foi possível remover temp:', err.message);
    });

    const { size } = fs.statSync(outputPath);
    console.log(
      `[sharp] ${req.file.originalname} → ${filename} | ` +
      `${(req.file.size / 1024).toFixed(1)} KB → ${(size / 1024).toFixed(1)} KB`
    );

    req.file = {
      ...req.file,
      filename,
      path    : outputPath,
      mimetype: 'image/webp',
      size,
      urlCurta: `/uploads/${filename}`, // ← string que entra no BD
    };

    return next();
  } catch (err) {
    fs.unlink(inputPath, () => {});
    return next(err);
  }
};

export default { comprimirFotoPerfil };
