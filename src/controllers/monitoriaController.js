/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/controllers/monitoriaController.js
 * Coração das regras de negócio de monitorias:
 *   - criarMonitoria      → monitor/admin
 *   - listarTodasMonitorias → público, paginado (máx 15/página), com dados do monitor
 *   - agendarVaga         → aluno (confirmado ou fila de espera automática)
 *   - cancelarAgendamento → aluno dono ou monitor/admin (promove fila automaticamente)
 *   - confirmarPresenca   → monitor/admin
 */

import { getSupabaseClient } from '../config/supabase.js';
import {
  sanitizeMonitoria,
  sanitizeMonitoriaInput,
  createMonitoria,
} from '../services/monitorias.service.js';
import {
  sanitizeAgendamento,
  createAgendamento,
  atualizarStatus,
} from '../services/agendamentos.service.js';

const LIMITE_MAXIMO = 15;

// ─── POST /api/monitorias ─────────────────────────────────────────────────────
// Exclusivo para monitor e admin (verificarPermissao na rota)
export const criarMonitoria = async (req, res) => {
  try {
    const { data, horario_inicio, horario_fim, sala, vagas_totais,
            area_conhecimento, disciplina_especifica } = req.body ?? {};

    if (!data || !horario_inicio || !horario_fim || !vagas_totais) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Campos obrigatórios: data, horario_inicio, horario_fim e vagas_totais.',
      });
    }

    const vagasNum = Number(vagas_totais);
    if (!Number.isInteger(vagasNum) || vagasNum < 1) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'vagas_totais deve ser um número inteiro maior que zero.',
      });
    }

    const monitoria = await createMonitoria({
      id_monitor: req.usuarioId,   // injetado pelo verificarToken
      data, horario_inicio, horario_fim, sala,
      vagas_totais: vagasNum,
      vagas_disponiveis: vagasNum, // começa com todas as vagas livres
      area_conhecimento,
      disciplina_especifica,
    });

    return res.status(201).json({ sucesso: true, monitoria });
  } catch (err) {
    console.error('[criarMonitoria]', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar monitoria.' });
  }
};

// ─── GET /api/monitorias ──────────────────────────────────────────────────────
// Público. Paginação via ?page=1&limit=15
// JOIN com usuarios para trazer nome e foto_perfil do monitor.
export const listarTodasMonitorias = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(LIMITE_MAXIMO, Math.max(1, parseInt(req.query.limit, 10) || LIMITE_MAXIMO));
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const supabase = await getSupabaseClient();

    const { data, error, count } = await supabase
      .from('monitorias')
      .select(
        `*, monitor:usuarios!monitorias_id_monitor_fkey(
          id, nome, foto_perfil, materia_especialidade
        )`,
        { count: 'exact' }
      )
      .order('data', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const total       = count ?? 0;
    const totalPaginas = Math.ceil(total / limit);

    return res.status(200).json({
      sucesso: true,
      dados: (data ?? []).map(row => ({
        ...sanitizeMonitoria(row),
        monitor: row.monitor ?? null,
      })),
      paginacao: {
        total,
        totalPaginas,
        paginaAtual : page,
        limite      : limit,
        temProxima  : page < totalPaginas,
        temAnterior : page > 1,
      },
    });
  } catch (err) {
    console.error('[listarTodasMonitorias]', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar monitorias.' });
  }
};

// ─── POST /api/monitorias/:id/agendar ────────────────────────────────────────
// Exclusivo para aluno (verificarPermissao na rota)
// Regra: vagas > 0 → confirmado + decrementa; vagas = 0 → espera (sem alterar vagas)
export const agendarVaga = async (req, res) => {
  try {
    const idMonitoria = parseInt(req.params.id, 10);
    const idAluno     = req.usuarioId;

    if (!idMonitoria) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de monitoria inválido.' });
    }

    const supabase = await getSupabaseClient();

    // Busca a monitoria para checar vagas
    const { data: monitoria, error: monErr } = await supabase
      .from('monitorias')
      .select('id, vagas_disponiveis')
      .eq('id', idMonitoria)
      .maybeSingle();

    if (monErr) throw monErr;
    if (!monitoria) {
      return res.status(404).json({ sucesso: false, mensagem: 'Monitoria não encontrada.' });
    }

    // Impede agendamento duplo
    const { data: jaAgendado } = await supabase
      .from('agendamentos')
      .select('id, status')
      .eq('id_monitoria', idMonitoria)
      .eq('id_aluno', idAluno)
      .maybeSingle();

    if (jaAgendado) {
      return res.status(409).json({
        sucesso: false,
        mensagem: `Você já possui um agendamento (${jaAgendado.status}) nesta monitoria.`,
      });
    }

    const temVaga = monitoria.vagas_disponiveis > 0;
    const status  = temVaga ? 'confirmado' : 'espera';

    // Cria o agendamento
    const agendamento = await createAgendamento({ id_monitoria: idMonitoria, id_aluno: idAluno, status });

    // Decrementa vagas só se confirmado
    if (temVaga) {
      const { error: updErr } = await supabase
        .from('monitorias')
        .update({ vagas_disponiveis: monitoria.vagas_disponiveis - 1 })
        .eq('id', idMonitoria);

      if (updErr) throw updErr;
    }

    return res.status(201).json({
      sucesso  : true,
      mensagem : temVaga
        ? 'Vaga confirmada com sucesso!'
        : 'Sem vagas no momento. Você foi adicionado à fila de espera.',
      agendamento,
    });
  } catch (err) {
    console.error('[agendarVaga]', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao agendar vaga.' });
  }
};

// ─── DELETE /api/agendamentos/:id ────────────────────────────────────────────
// Aluno dono cancela o próprio; monitor/admin pode cancelar qualquer um.
// Regra: cancelamento de 'confirmado' → promove o 1º da fila de espera
//        e libera 1 vaga (ou devolve a vaga se fila vazia).
export const cancelarAgendamento = async (req, res) => {
  try {
    const idAgendamento = parseInt(req.params.id, 10);
    const supabase = await getSupabaseClient();

    // Busca o agendamento
    const { data: agendamento, error: agErr } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', idAgendamento)
      .maybeSingle();

    if (agErr) throw agErr;
    if (!agendamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Agendamento não encontrado.' });
    }

    // Só o dono, o monitor da monitoria ou admin pode cancelar
    const ehDono   = agendamento.id_aluno === req.usuarioId;
    const ehAdmin  = req.usuarioTipo === 'admin';
    const ehMonitor = req.usuarioTipo === 'monitor';

    if (!ehDono && !ehAdmin && !ehMonitor) {
      return res.status(403).json({ sucesso: false, mensagem: 'Sem permissão para cancelar este agendamento.' });
    }

    // Remove o agendamento
    const { error: delErr } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', idAgendamento);

    if (delErr) throw delErr;

    let promovido = null;

    if (agendamento.status === 'confirmado') {
      // Promove o 1º da fila de espera (o mais antigo, pelo id)
      const { data: filaEspera } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id_monitoria', agendamento.id_monitoria)
        .eq('status', 'espera')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (filaEspera) {
        // Promove para confirmado
        const { data: promovido_data, error: promErr } = await supabase
          .from('agendamentos')
          .update({ status: 'confirmado' })
          .eq('id', filaEspera.id)
          .select()
          .single();

        if (promErr) throw promErr;
        promovido = sanitizeAgendamento(promovido_data);

        // Vagas permanecem 0 (a vaga foi transferida diretamente para o próximo da fila)
      } else {
        // Fila vazia → devolve a vaga para a monitoria
        const { data: mon } = await supabase
          .from('monitorias')
          .select('vagas_disponiveis, vagas_totais')
          .eq('id', agendamento.id_monitoria)
          .single();

        const novasVagas = Math.min(
          Number(mon.vagas_totais),
          Number(mon.vagas_disponiveis) + 1
        );

        await supabase
          .from('monitorias')
          .update({ vagas_disponiveis: novasVagas })
          .eq('id', agendamento.id_monitoria);
      }
    }

    return res.status(200).json({
      sucesso  : true,
      mensagem : 'Agendamento cancelado com sucesso.',
      // Gatilho de notificação: front-end usa esse campo para avisar o aluno promovido
      notificacao: promovido
        ? { tipo: 'promocao_fila', agendamento: promovido }
        : null,
    });
  } catch (err) {
    console.error('[cancelarAgendamento]', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao cancelar agendamento.' });
  }
};

// ─── PATCH /api/agendamentos/:id/presenca ─────────────────────────────────────
// Exclusivo para monitor e admin.
// Body: { presenca: 1 (presente) | 0 (ausente) }
export const confirmarPresenca = async (req, res) => {
  try {
    const idAgendamento = parseInt(req.params.id, 10);
    const { presenca }  = req.body ?? {};

    if (presenca !== 0 && presenca !== 1) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O campo presenca deve ser 1 (presente) ou 0 (ausente).',
      });
    }

    const supabase = await getSupabaseClient();

    const { data: agendamento, error: agErr } = await supabase
      .from('agendamentos')
      .select('id, status')
      .eq('id', idAgendamento)
      .maybeSingle();

    if (agErr) throw agErr;
    if (!agendamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Agendamento não encontrado.' });
    }

    if (agendamento.status !== 'confirmado') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Só é possível registrar presença em agendamentos com status confirmado.',
      });
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update({ presenca })
      .eq('id', idAgendamento)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      sucesso    : true,
      mensagem   : presenca === 1 ? 'Presença confirmada.' : 'Ausência registrada.',
      agendamento: sanitizeAgendamento(data),
    });
  } catch (err) {
    console.error('[confirmarPresenca]', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao registrar presença.' });
  }
};

export default {
  criarMonitoria,
  listarTodasMonitorias,
  agendarVaga,
  cancelarAgendamento,
  confirmarPresenca,
};
