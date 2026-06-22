/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/questoesPdf.service.js
 * Camada de acesso à tabela "questoes_pdf": sanitização de dados e
 * consultas do banco de questões (PDFs de provas/vestibulares).
 */

import { getSupabaseClient } from '../config/supabase.js';

const TABLE = 'questoes_pdf';

/**
 * Normaliza/higieniza uma linha da tabela "questoes_pdf".
 * @param {object} row
 * @returns {object|null}
 */
export function sanitizeQuestaoPdf(row) {
  if (!row) return null;
  return {
    id: row.id,
    titulo: String(row.titulo ?? '').trim(),
    nome_arquivo: row.nome_arquivo ?? null,
    id_materia: Number(row.id_materia) || null,
    ano: Number(row.ano) || null,
    enviado_por: row.enviado_por ?? null,
    origem_vestibular: row.origem_vestibular ? String(row.origem_vestibular).trim() : null,
  };
}

/**
 * Higieniza um objeto de entrada para criação de registro de questão/PDF.
 * @param {object} input
 * @returns {object}
 */
export function sanitizeQuestaoPdfInput(input) {
  return {
    titulo: String(input.titulo ?? '').trim(),
    nome_arquivo: input.nome_arquivo ? String(input.nome_arquivo).trim() : null,
    id_materia: Number(input.id_materia),
    ano: Number(input.ano),
    enviado_por: input.enviado_por,
    origem_vestibular: input.origem_vestibular ? String(input.origem_vestibular).trim() : null,
  };
}

/**
 * Lista as questões/PDFs de uma matéria específica, mais recentes primeiro.
 * @param {number} idMateria
 * @returns {Promise<object[]>}
 */
export async function listQuestoesPorMateria(idMateria) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id_materia', idMateria)
    .order('ano', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(sanitizeQuestaoPdf);
}

/**
 * Cria um novo registro de questão/PDF no banco de questões.
 * @param {object} input
 * @returns {Promise<object>}
 */
export async function createQuestaoPdf(input) {
  const supabase = await getSupabaseClient();
  const payload = sanitizeQuestaoPdfInput(input);

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) throw error;
  return sanitizeQuestaoPdf(data);
}

export default {
  sanitizeQuestaoPdf,
  sanitizeQuestaoPdfInput,
  listQuestoesPorMateria,
  createQuestaoPdf,
};
