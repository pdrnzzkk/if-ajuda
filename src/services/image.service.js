/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/image.service.js
 * Usa o Sharp para otimizar e redimensionar imagens enviadas por upload
 * (ex: anexos de questões), reduzindo peso e padronizando o formato.
 */

import sharp from 'sharp';

/**
 * Otimiza um buffer de imagem: redimensiona (largura máxima) e converte para WebP.
 * @param {Buffer} buffer - buffer da imagem original (ex: vindo do Multer)
 * @param {number} maxWidth - largura máxima em pixels
 * @returns {Promise<Buffer>} buffer da imagem otimizada
 */
export async function optimizeImage(buffer, maxWidth = 1200) {
  return sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

export default { optimizeImage };
