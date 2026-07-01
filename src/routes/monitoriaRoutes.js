/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/routes/monitoriaRoutes.js
 * Rotas de monitorias e agendamentos, protegidas pelo middleware JWT.
 *
 * Prefixo montado em server.js: /api
 * Endpoints resultantes:
 *   POST   /api/monitorias                    → monitor, admin
 *   GET    /api/monitorias                    → público (com paginação)
 *   POST   /api/monitorias/:id/agendar        → aluno
 *   DELETE /api/agendamentos/:id              → dono, monitor, admin
 *   PATCH  /api/agendamentos/:id/presenca     → monitor, admin
 */

import { Router } from 'express';
import { verificarToken, verificarPermissao } from '../middlewares/authMiddleware.js';
import {
  criarMonitoria,
  listarTodasMonitorias,
  agendarVaga,
  cancelarAgendamento,
  confirmarPresenca,
} from '../controllers/monitoriaController.js';

const router = Router();

// ── Monitorias ────────────────────────────────────────────────────────────────

// Criar monitoria (exclusivo monitor/admin)
router.post(
  '/monitorias',
  verificarToken,
  verificarPermissao(['monitor', 'admin']),
  criarMonitoria
);

// Listar todas as monitorias — público, paginado
router.get('/monitorias', listarTodasMonitorias);

// ── Agendamentos ──────────────────────────────────────────────────────────────

// Agendar vaga (exclusivo aluno)
router.post(
  '/monitorias/:id/agendar',
  verificarToken,
  verificarPermissao(['aluno']),
  agendarVaga
);

// Cancelar agendamento (dono, monitor ou admin — verificado dentro do controller)
router.delete(
  '/agendamentos/:id',
  verificarToken,
  cancelarAgendamento
);

// Confirmar presença/ausência (exclusivo monitor/admin)
router.patch(
  '/agendamentos/:id/presenca',
  verificarToken,
  verificarPermissao(['monitor', 'admin']),
  confirmarPresenca
);

export default router;
