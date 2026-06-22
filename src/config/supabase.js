/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/config/supabase.js
 * Inicializa o cliente Supabase (PostgreSQL) usado para acesso ao banco de
 * dados (usuarios, materias, monitorias, agendamentos, questoes_pdf).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[IF-Ajuda] SUPABASE_URL e/ou SUPABASE_KEY não definidos no .env'
  );
}

// Cria a instância única do cliente imediatamente
const supabaseInstance = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // não usamos o sistema de Auth do Supabase (JWT é próprio)
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Retorna a instância conectada do cliente Supabase.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function getSupabaseClient() {
  return supabaseInstance;
}

// Exportações explícitas suportadas pelo JavaScript moderno
export { supabaseInstance as supabase };
export default getSupabaseClient;