/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/agendamentos.service.js
 * Camada de acesso à tabela "agendamentos": sanitização de dados, criação
 * de agendamentos e controle de status/presença.
 */

import { getSupabaseClient } from '../config/supabase.js';

const TABLE = 'agendamentos';
const STATUS_VALIDOS = ['confirmado', 'espera'];

/**
 * Normaliza/higieniza uma linha da tabela "agendamentos".
 * @param {object} row
 * @returns {object|null}
 */
export function sanitizeAgendamento(row) {
  if (!row) return null;
  return {
    id: row.id,
    id_monitoria: Number(row.id_monitoria),
    id_aluno: row.id_aluno,
    status: STATUS_VALIDOS.includes(row.status) ? row.status : 'espera',
    data_agendamento: row.data_agendamento ?? null,
    // presenca: 1 = presente, 0 = ausente, null = ainda não registrado
    presenca: row.presenca === 1 || row.presenca === 0 ? row.presenca : null,
  };
}

/**
 * Higieniza um objeto de entrada para criação de agendamento.
 * @param {object} input
 * @returns {object}
 */
export function sanitizeAgendamentoInput(input) {
  return {
    id_monitoria: Number(input.id_monitoria),
    id_aluno: input.id_aluno,
    status: STATUS_VALIDOS.includes(input.status) ? input.status : 'espera',
    presenca: null,
  };
}

/**
 * Cria um novo agendamento.
 * @param {object} input
 * @returns {Promise<object>}
 */
export async function createAgendamento(input) {
  const supabase = await getSupabaseClient();
  const payload = sanitizeAgendamentoInput(input);

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) throw error;
  return sanitizeAgendamento(data);
}

/**
 * Lista os agendamentos de um aluno específico, já higienizados.
 * @param {string} idAluno
 * @returns {Promise<object[]>}
 */
export async function listAgendamentosPorAluno(idAluno) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id_aluno', idAluno)
    .order('data_agendamento', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(sanitizeAgendamento);
}

/**
 * Atualiza o status de um agendamento (ex: de "espera" para "confirmado").
 * @param {number} id
 * @param {'confirmado'|'espera'} status
 * @returns {Promise<object>}
 */
export async function atualizarStatus(id, status) {
  if (!STATUS_VALIDOS.includes(status)) {
    throw new Error(`Status inválido: ${status}`);
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return sanitizeAgendamento(data);
}

/**
 * Registra a presença (ou ausência) de um aluno em uma monitoria.
 * @param {number} id
 * @param {boolean} presente
 * @returns {Promise<object>}
 */
export async function registrarPresenca(id, presente) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ presenca: presente ? 1 : 0 })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return sanitizeAgendamento(data);
}

export default {
  sanitizeAgendamento,
  sanitizeAgendamentoInput,
  createAgendamento,
  listAgendamentosPorAluno,
  atualizarStatus,
  registrarPresenca,
};
