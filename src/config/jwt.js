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

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'if-ajuda-dev-secret-troque-em-producao',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export default jwtConfig;
