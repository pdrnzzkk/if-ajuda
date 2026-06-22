/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/middlewares/rateLimiter.middleware.js
 * Limita cada IP a 60 requisições por minuto, protegendo o servidor
 * contra sobrecarga e ataques de força bruta/negação de serviço.
 */

import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // janela de 1 minuto
  max: 60, // 60 requisições por IP dentro da janela
  standardHeaders: true, // retorna informações de limite nos headers RateLimit-*
  legacyHeaders: false, // desativa os headers antigos X-RateLimit-*
  message: {
    error: 'Limite de requisições excedido. Tente novamente em alguns instantes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

export default rateLimiter;
