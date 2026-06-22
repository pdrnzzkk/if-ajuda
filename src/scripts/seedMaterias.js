/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/scripts/seedMaterias.js
 * Script executável: popula a tabela "materias" com a grade curricular
 * do campus, caso ela ainda esteja vazia.
 *
 * Uso: npm run seed:materias
 */

import { seedMateriasIfEmpty } from '../services/materias.service.js';

async function run() {
  try {
    console.log('[IF-Ajuda] Verificando tabela "materias"...');
    const resultado = await seedMateriasIfEmpty();

    if (resultado.seeded) {
      console.log(`[IF-Ajuda] ✅ Seed concluído com sucesso (${resultado.total} matérias).`);
    } else {
      console.log(`[IF-Ajuda] ℹ️ Nada a fazer: a tabela já tinha ${resultado.total} matéria(s).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('[IF-Ajuda] ❌ Erro ao executar o seed de matérias:', error.message);
    process.exit(1);
  }
}

run();
