/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/server.js
 * Ponto de entrada da aplicação. Configura o Express, os middlewares
 * globais (CORS, parser JSON e limitação de requisições) e inicia o servidor.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimiter from './middlewares/rateLimiter.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de CORS - permite requisições de origens externas (front-end)
app.use(cors());

// Middleware para interpretar corpos de requisição no formato JSON
app.use(express.json());

// Middleware global de limitação de requisições (proteção contra abuso/queda do servidor)
app.use(rateLimiter);

// Servir arquivos estáticos do front-end (public/)
app.use(express.static('public'));

// Rota de verificação de saúde da API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'IF-Ajuda API',
    timestamp: new Date().toISOString(),
  });
});

// Middleware de tratamento de erros (deve ficar sempre por último)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

app.listen(PORT, () => {
  console.log(`IF-Ajuda rodando em http://localhost:${PORT}`);
});

export default app;
