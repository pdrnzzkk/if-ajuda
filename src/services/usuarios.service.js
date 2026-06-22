/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/services/usuarios.service.js
 * Camada de acesso à tabela "usuarios": sanitização de dados e consultas.
 *
 * IMPORTANTE: sanitizeUsuario() NUNCA deve devolver o campo senha_hash.
 * Esse campo só deve circular internamente (ex: para comparação no login).
 */

import { getSupabaseClient } from '../config/supabase.js';

const TABLE = 'usuarios';
const TIPOS_VALIDOS = ['aluno', 'monitor', 'admin'];

/**
 * Normaliza/higieniza uma linha da tabela "usuarios" para uso externo
 * (resposta de API, sessão, etc.) — nunca inclui senha_hash.
 * @param {object} row
 * @returns {object|null}
 */
export function sanitizeUsuario(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: String(row.nome ?? '').trim(),
    email: String(row.email ?? '').trim().toLowerCase(),
    ra_siape_cpf: row.ra_siape_cpf ?? null,
    ano_turma: row.ano_turma ?? null,
    foto_perfil: row.foto_perfil ?? null,
    tipo: TIPOS_VALIDOS.includes(row.tipo) ? row.tipo : 'aluno',
    materia_especialidade: row.materia_especialidade ?? null,
    data_cadastro: row.data_cadastro ?? null,
  };
}

/**
 * Higieniza um objeto de entrada para criação/atualização de usuário.
 * Não inclui senha_hash aqui: o hash deve ser gerado previamente via
 * src/services/auth.service.js (hashPassword) e passado separadamente.
 * @param {object} input
 * @returns {object}
 */
export function sanitizeUsuarioInput(input) {
  const tipo = TIPOS_VALIDOS.includes(input.tipo) ? input.tipo : 'aluno';

  return {
    nome: String(input.nome ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    ra_siape_cpf: input.ra_siape_cpf ? String(input.ra_siape_cpf).trim() : null,
    ano_turma: input.ano_turma ? String(input.ano_turma).trim() : null,
    foto_perfil: input.foto_perfil ?? null,
    tipo,
    materia_especialidade: input.materia_especialidade
      ? String(input.materia_especialidade).trim()
      : null,
  };
}

/**
 * Busca um usuário pelo e-mail. Inclui senha_hash no retorno (uso interno
 * apenas, ex: comparação de login) — NUNCA repassar esse retorno direto
 * para o cliente; sempre passar por sanitizeUsuario() antes de responder.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUsuarioByEmailRaw(email) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', String(email).trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Busca um usuário pelo id, já higienizado (sem senha_hash).
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findUsuarioById(id) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return sanitizeUsuario(data);
}

/**
 * Cria um novo usuário. O hash de senha já deve vir pronto (gerado com
 * hashPassword() em auth.service.js).
 * @param {object} input - campos do usuário (sem senha_hash)
 * @param {string} senhaHash - hash bcrypt já calculado
 * @returns {Promise<object>} usuário higienizado (sem senha_hash)
 */
export async function createUsuario(input, senhaHash) {
  const supabase = await getSupabaseClient();
  const payload = { ...sanitizeUsuarioInput(input), senha_hash: senhaHash };

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) throw error;
  return sanitizeUsuario(data);
}

export default {
  sanitizeUsuario,
  sanitizeUsuarioInput,
  findUsuarioByEmailRaw,
  findUsuarioById,
  createUsuario,
};
