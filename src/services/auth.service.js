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
import jwtConfig from '../config/jwt.js';

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
 * @returns {string} token assinado
 */
export function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

/**
 * Verifica e decodifica um token JWT.
 * @param {string} token
 * @returns {object} payload decodificado
 */
export function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

export default { hashPassword, comparePassword, generateToken, verifyToken };
