/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/server.js
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimiter from './middlewares/rateLimiter.middleware.js';
import routes from './routes/index.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// CORS — permite requisições do front-end
app.use(cors());

// Interpreta corpo JSON
app.use(express.json());

// Rate limiter global
app.use(rateLimiter);

// Arquivos estáticos: front-end (HTML/CSS/JS) + fotos de perfil WebP
app.use(express.static('public'));

// Todas as rotas da API em /api
app.use('/api', routes);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status   : 'ok',
    service  : 'IF-Ajuda API',
    timestamp: new Date().toISOString(),
  });
});

// Tratamento global de erros (sempre por último)
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    sucesso : false,
    mensagem: err.message || 'Erro interno do servidor',
  });
});

app.listen(PORT, () => {
  console.log(`IF-Ajuda rodando em http://localhost:${PORT}`);
});

export default app;
