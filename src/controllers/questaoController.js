/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/controllers/questaoController.js
 * Métodos:
 *   fazerUploadQuestao — recebe PDF validado pelo Multer e persiste no BD
 *   listarQuestoes     — lista questões por matéria com paginação nativa
 */

import fs from 'fs';
import { getSupabaseClient } from '../config/supabase.js';

const TABLE = 'questoes_pdf';

// ---------------------------------------------------------------------------
// POST /api/questoes/upload
//
// Body (multipart/form-data):
//   arquivo      — PDF (processado pelo Multer)
//   id_materia   — ID da matéria (obrigatório)
//   titulo       — título da questão (opcional)
//   ano          — ano da prova (opcional)
//   origem_vestibular — banca/vestibular (opcional)
// ---------------------------------------------------------------------------
export const fazerUploadQuestao = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo PDF foi enviado.' });
    }

    const { id_materia, titulo, ano, origem_vestibular } = req.body;

    if (!id_materia) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ sucesso: false, mensagem: 'O campo id_materia é obrigatório.' });
    }

    const supabase = await getSupabaseClient();

    // Verifica se a matéria existe
    const { data: materia, error: materiaError } = await supabase
      .from('materias')
      .select('id')
      .eq('id', id_materia)
      .maybeSingle();

    if (materiaError || !materia) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ sucesso: false, mensagem: 'Matéria não encontrada.' });
    }

    // Salva apenas a URL relativa (não o path absoluto)
    const nome_arquivo = `/uploads/${req.file.filename}`;

    const { data: questao, error } = await supabase
      .from(TABLE)
      .insert({
        id_materia   : Number(id_materia),
        titulo       : titulo || req.file.originalname.replace('.pdf', ''),
        ano          : ano ? Number(ano) : null,
        origem_vestibular: origem_vestibular || null,
        nome_arquivo,
        enviado_por  : req.usuarioId ?? null, // injetado pelo authMiddleware
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ sucesso: true, mensagem: 'Questão enviada com sucesso.', questao });

  } catch (err) {
    console.error('[questaoController] fazerUploadQuestao:', err);
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao fazer upload.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/questoes?id_materia=X&pagina=1&limite=10
//
// Paginação nativa via range do Supabase (equivalente a OFFSET/LIMIT).
// ---------------------------------------------------------------------------
export const listarQuestoes = async (req, res) => {
  try {
    const { id_materia } = req.query;

    if (!id_materia) {
      return res.status(400).json({ sucesso: false, mensagem: 'O parâmetro id_materia é obrigatório.' });
    }

    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = Math.min(100, Math.max(1, parseInt(req.query.limite, 10) || 10));
    const from   = (pagina - 1) * limite;
    const to     = from + limite - 1;

    const supabase = await getSupabaseClient();

    const { data: questoes, error, count } = await supabase
      .from(TABLE)
      .select('*, materias(id, nome_materia)', { count: 'exact' })
      .eq('id_materia', id_materia)
      .order('ano', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total       = count ?? 0;
    const totalPaginas = Math.ceil(total / limite);

    return res.status(200).json({
      sucesso: true,
      dados  : questoes,
      paginacao: {
        total,
        totalPaginas,
        paginaAtual : pagina,
        limite,
        temProxima  : pagina < totalPaginas,
        temAnterior : pagina > 1,
      },
    });

  } catch (err) {
    console.error('[questaoController] listarQuestoes:', err);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao listar questões.' });
  }
};

export default { fazerUploadQuestao, listarQuestoes };
