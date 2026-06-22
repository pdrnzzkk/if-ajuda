/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/monitorias.service.js
 * Camada de acesso à tabela "monitorias": sanitização de dados, consultas
 * e controle de vagas disponíveis.
 */

import { getSupabaseClient } from '../config/supabase.js';

const TABLE = 'monitorias';

/**
 * Normaliza/higieniza uma linha da tabela "monitorias".
 * @param {object} row
 * @returns {object|null}
 */
export function sanitizeMonitoria(row) {
  if (!row) return null;
  return {
    id: row.id,
    id_monitor: row.id_monitor,
    data: row.data ?? null,
    horario_inicio: row.horario_inicio ?? null,
    horario_fim: row.horario_fim ?? null,
    vagas_totais: Number(row.vagas_totais) || 0,
    vagas_disponiveis: Number(row.vagas_disponiveis) || 0,
    sala: row.sala ?? null,
    area_conhecimento: row.area_conhecimento ?? null,
    disciplina_especifica: row.disciplina_especifica ?? null,
  };
}

/**
 * Higieniza um objeto de entrada para criação de monitoria. Por padrão,
 * vagas_disponiveis começa igual a vagas_totais.
 * @param {object} input
 * @returns {object}
 */
export function sanitizeMonitoriaInput(input) {
  const vagasTotais = Number(input.vagas_totais) || 0;

  return {
    id_monitor: input.id_monitor,
    data: String(input.data ?? '').trim(),
    horario_inicio: String(input.horario_inicio ?? '').trim(),
    horario_fim: String(input.horario_fim ?? '').trim(),
    vagas_totais: vagasTotais,
    vagas_disponiveis: input.vagas_disponiveis != null ? Number(input.vagas_disponiveis) : vagasTotais,
    sala: input.sala ? String(input.sala).trim() : null,
    area_conhecimento: input.area_conhecimento ? String(input.area_conhecimento).trim() : null,
    disciplina_especifica: input.disciplina_especifica
      ? String(input.disciplina_especifica).trim()
      : null,
  };
}

/**
 * Lista monitorias com vagas disponíveis (vagas_disponiveis > 0), já
 * higienizadas, ordenadas por data.
 * @returns {Promise<object[]>}
 */
export async function listMonitoriasDisponiveis() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .gt('vagas_disponiveis', 0)
    .order('data');

  if (error) throw error;
  return (data ?? []).map(sanitizeMonitoria);
}

/**
 * Cria uma nova monitoria.
 * @param {object} input
 * @returns {Promise<object>}
 */
export async function createMonitoria(input) {
  const supabase = await getSupabaseClient();
  const payload = sanitizeMonitoriaInput(input);

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) throw error;
  return sanitizeMonitoria(data);
}

/**
 * Decrementa em 1 a quantidade de vagas disponíveis de uma monitoria
 * (chamado ao confirmar um agendamento). Nunca deixa o valor ir abaixo de 0.
 * @param {number} idMonitoria
 * @returns {Promise<object>}
 */
export async function decrementarVaga(idMonitoria) {
  const supabase = await getSupabaseClient();

  const { data: atual, error: fetchError } = await supabase
    .from(TABLE)
    .select('vagas_disponiveis')
    .eq('id', idMonitoria)
    .single();

  if (fetchError) throw fetchError;

  const novasVagas = Math.max(0, Number(atual.vagas_disponiveis) - 1);

  const { data, error } = await supabase
    .from(TABLE)
    .update({ vagas_disponiveis: novasVagas })
    .eq('id', idMonitoria)
    .select()
    .single();

  if (error) throw error;
  return sanitizeMonitoria(data);
}

export default {
  sanitizeMonitoria,
  sanitizeMonitoriaInput,
  listMonitoriasDisponiveis,
  createMonitoria,
  decrementarVaga,
};
