/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/config/supabase.js
 * Inicializa o cliente Supabase (PostgreSQL) usado para acesso ao banco de
 * dados (usuarios, materias, monitorias, agendamentos, questoes_pdf).
 *
 * A instância é criada de forma "lazy" (preguiçosa) e assíncrona: a conexão
 * só é montada na primeira chamada de getSupabaseClient() e reaproveitada
 * (padrão singleton) nas chamadas seguintes, suportando bem múltiplos
 * acessos simultâneos no campus sem reabrir conexões repetidas vezes.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Aceita vários nomes de variável para a chave, por compatibilidade com
// diferentes convenções: SUPABASE_SERVICE_ROLE_KEY (nome oficial do painel
// do Supabase), SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY ou SUPABASE_KEY.
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''
).trim();

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let supabaseInstance = null;

/**
 * Retorna a instância conectada do cliente Supabase, criando-a de forma
 * assíncrona (e apenas uma vez) na primeira chamada.
 *
 * Importante: a validação das variáveis de ambiente acontece AQUI DENTRO,
 * não no topo do arquivo — assim, se faltar configuração, o erro só
 * estoura quando alguém de fato tentar usar o banco, e pode ser capturado
 * normalmente com try/catch por quem chamou. Lançar o erro no topo do
 * arquivo (fora de qualquer função) faria o processo inteiro travar no
 * carregamento do módulo, sem chance de tratamento.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      '[IF-Ajuda] SUPABASE_URL e/ou SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_KEY) não definidos no .env'
    );
  }

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false, // não usamos o sistema de Auth do Supabase (JWT é próprio)
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });

  return supabaseInstance;
}

export default getSupabaseClient;
