import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import rateLimiter from './middlewares/rateLimiter.middleware.js';
import authRoutes from './routes/authRoutes.js'; // Agora sim as chaves já existem!

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

// 2. Vincular as rotas de autenticação ao Express
app.use('/api/auth', authRoutes);

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