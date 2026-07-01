/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/auth.service.js
 * Funções utilitárias de autenticação: hash/comparação de senhas (bcryptjs)
 * e geração/verificação de tokens de sessão (jsonwebtoken).
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtConfig } from '../config/jwt.js';

const SALT_ROUNDS = 10;

/**
 * Gera o hash de uma senha em texto puro.
 * @param {string} plainPassword
 * @returns {Promise<string>} hash da senha
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto puro com um hash armazenado.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Gera um token JWT a partir de um payload (ex: id e papel do usuário).
 * @param {object} payload
 * @param {string} [expiresIn] - sobrescreve o tempo de expiração padrão
 * @returns {string} token assinado
 */
export function generateToken(payload, expiresIn) {
  const { secret, expiresIn: defaultExpiry } = getJwtConfig();
  return jwt.sign(payload, secret, { expiresIn: expiresIn ?? defaultExpiry });
}

/**
 * Verifica e decodifica um token JWT.
 * @param {string} token
 * @returns {object} payload decodificado
 */
export function verifyToken(token) {
  const { secret } = getJwtConfig();
  return jwt.verify(token, secret);
}

export default { hashPassword, comparePassword, generateToken, verifyToken };
