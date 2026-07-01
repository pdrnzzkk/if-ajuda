/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/config/jwt.js
 * Centraliza a configuração do JWT (segredo e tempo de expiração)
 * usado para autenticação de alunos, monitores e administradores.
 */

import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET   = (process.env.JWT_SECRET   || '').trim();
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h').trim();

/**
 * Retorna a configuração do JWT, validando a presença do segredo
 * somente quando chamado (padrão lazy, igual ao getSupabaseClient).
 * Assim, um .env incompleto só estoura erro no momento de uso real
 * (geração/verificação de token), não na inicialização do módulo.
 * @returns {{ secret: string, expiresIn: string }}
 */
export function getJwtConfig() {
  if (!JWT_SECRET) {
    throw new Error(
      '[IF-Ajuda] JWT_SECRET não definido no .env — defina um segredo forte antes de usar autenticação.'
    );
  }
  return { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN };
}

export default getJwtConfig;
