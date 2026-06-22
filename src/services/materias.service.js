/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/materias.service.js
 * Camada de acesso à tabela "materias": sanitização de dados, consultas
 * e o seed automático da grade curricular do campus.
 */

import { getSupabaseClient } from '../config/supabase.js';
import { materiasDoIF } from '../config/seedData/materiasIF.js';

const TABLE = 'materias';

/**
 * Normaliza/higieniza uma linha da tabela "materias" antes de devolvê-la
 * para o restante da aplicação (remove espaços, garante tipos corretos).
 * @param {object} row
 * @returns {object}
 */
export function sanitizeMateria(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome_materia: String(row.nome_materia ?? '').trim(),
    curso: String(row.curso ?? '').trim(),
    ano_curricular: Number(row.ano_curricular) || null,
    area_conhecimento: String(row.area_conhecimento ?? '').trim(),
  };
}

/**
 * Higieniza um objeto de entrada (vindo de um formulário/requisição)
 * antes de inserir na tabela "materias".
 * @param {object} input
 * @returns {object}
 */
export function sanitizeMateriaInput(input) {
  return {
    nome_materia: String(input.nome_materia ?? '').trim(),
    curso: String(input.curso ?? '').trim(),
    ano_curricular: Number(input.ano_curricular),
    area_conhecimento: String(input.area_conhecimento ?? '').trim(),
  };
}

/**
 * Lista todas as matérias cadastradas, já higienizadas.
 * @returns {Promise<object[]>}
 */
export async function listMaterias() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from(TABLE).select('*').order('ano_curricular');

  if (error) throw error;
  return (data ?? []).map(sanitizeMateria);
}

/**
 * Cria uma nova matéria a partir de um input já higienizado.
 * @param {object} input
 * @returns {Promise<object>}
 */
export async function createMateria(input) {
  const supabase = await getSupabaseClient();
  const payload = sanitizeMateriaInput(input);

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) throw error;
  return sanitizeMateria(data);
}

/**
 * Verifica se a tabela "materias" está vazia e, caso esteja, popula
 * automaticamente com a grade curricular completa do campus
 * (src/config/seedData/materiasIF.js). É seguro chamar essa função
 * múltiplas vezes: se já houver dados, ela não faz nada.
 * @returns {Promise<{ seeded: boolean, total: number }>}
 */
export async function seedMateriasIfEmpty() {
  const supabase = await getSupabaseClient();

  const { count, error: countError } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  if (count && count > 0) {
    console.log(`[IF-Ajuda] Seed ignorado: tabela "materias" já tem ${count} registro(s).`);
    return { seeded: false, total: count };
  }

  const payload = materiasDoIF.map(sanitizeMateriaInput);

  const { error: insertError } = await supabase.from(TABLE).insert(payload).select();

  if (insertError) throw insertError;

  console.log(`[IF-Ajuda] Seed concluído: ${payload.length} matérias inseridas.`);
  return { seeded: true, total: payload.length };
}

export default {
  sanitizeMateria,
  sanitizeMateriaInput,
  listMaterias,
  createMateria,
  seedMateriasIfEmpty,
};
