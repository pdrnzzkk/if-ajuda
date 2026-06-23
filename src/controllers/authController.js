
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// ─── Guarda de segurança: JWT_SECRET obrigatório na inicialização ─────────────
if (!process.env.JWT_SECRET) {
  throw new Error('[FATAL] JWT_SECRET não definido nas variáveis de ambiente. Servidor encerrado.');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Valida e-mail institucional do IFSULDEMINAS ──────────────────────────────
const validarEmailInstitucional = (email) => {
  const dominiosPermitidos = [
    /@alunos\.ifsuldeminas\.edu\.br$/, // Estudantes
    /@ifsuldeminas\.edu\.br$/,         // Servidores / Professores
  ];
  return dominiosPermitidos.some((regex) => regex.test(email));
};

// ─── POST /auth/registrar ─────────────────────────────────────────────────────
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, ra_siape_cpf, ano_turma, tipo } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !email || !senha || !ra_siape_cpf || !ano_turma || !tipo) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Todos os campos são obrigatórios: nome, email, senha, ra_siape_cpf, ano_turma e tipo.',
      });
    }

    // Validação do tipo de usuário
    const tiposPermitidos = ['aluno', 'monitor', 'admin'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Tipo inválido. Use: ${tiposPermitidos.join(', ')}.`,
      });
    }

    // Validação do e-mail institucional do IFSULDEMINAS
    if (!validarEmailInstitucional(email)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Utilize um e-mail institucional do IFSULDEMINAS válido (@alunos.ifsuldeminas.edu.br ou @ifsuldeminas.edu.br).',
      });
    }

    // Verifica se o e-mail já está cadastrado
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (usuarioExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'E-mail já cadastrado.',
      });
    }

    // Criptografa a senha com 10 salt rounds
    const senhaHash = await bcrypt.hash(senha, 10);

    // Persiste o novo usuário no Supabase
    const { data: novoUsuario, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nome,
          email,
          senha_hash: senhaHash,
          ra_siape_cpf,
          ano_turma,
          tipo,
          foto_perfil: null,
        },
      ])
      .select('id, nome, email, ra_siape_cpf, ano_turma, tipo, foto_perfil, data_cadastro')
      .single();

    if (error) {
      console.error('[registrar] Erro no Supabase:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar usuário. Tente novamente.',
      });
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário registrado com sucesso.',
      usuario: novoUsuario,
    });
  } catch (err) {
    console.error('[registrar] Erro inesperado:', err);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor.',
    });
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'E-mail e senha são obrigatórios.',
      });
    }

    // Busca o usuário pelo e-mail
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, senha_hash, ra_siape_cpf, ano_turma, tipo, foto_perfil, data_cadastro')
      .eq('email', email)
      .maybeSingle();

    if (error || !usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas.',
      });
    }

    // Compara a senha fornecida com o hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas.',
      });
    }

    // Monta o payload público (sem senha_hash) para o cliente
    const dadosPublicos = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ra_siape_cpf: usuario.ra_siape_cpf,
      ano_turma: usuario.ano_turma,
      tipo: usuario.tipo,
      foto_perfil: usuario.foto_perfil,
      data_cadastro: usuario.data_cadastro,
    };

    // Gera o token JWT com expiração de 24 horas
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retorna token + todos os dados acadêmicos para o cliente salvar no localStorage
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: dadosPublicos,
    });
  } catch (err) {
    console.error('[login] Erro inesperado:', err);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor.',
    });
  }
};
