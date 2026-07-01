/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/controllers/authController.js
 * Controlador de autenticação: registro de novos usuários e login,
 * com validação do e-mail institucional e emissão de token JWT.
 */

import { hashPassword, comparePassword, generateToken } from '../services/auth.service.js';
import { createUsuario, findUsuarioByEmailRaw, sanitizeUsuario } from '../services/usuarios.service.js';
import { validarEmailInstitucional } from '../middlewares/authMiddleware.js';

const TIPOS_VALIDOS = ['aluno', 'monitor', 'admin'];
const SENHA_MIN_LENGTH = 6;

/**
 * POST /auth/registrar
 * Cria um novo usuário (aluno, monitor ou admin), validando o e-mail
 * institucional de acordo com o tipo e criptografando a senha com
 * bcryptjs (10 salt rounds, já configurado em auth.service.js).
 */
export async function registrar(req, res) {
  try {
    const { nome, email, senha, ra_siape_cpf, ano_turma, tipo } = req.body ?? {};

    if (!nome || !email || !senha || !ra_siape_cpf || !tipo) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, email, senha, ra_siape_cpf e tipo.',
      });
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        erro: `Tipo de usuário inválido. Use um de: ${TIPOS_VALIDOS.join(', ')}.`,
      });
    }

    if (String(senha).length < SENHA_MIN_LENGTH) {
      return res.status(400).json({
        erro: `A senha deve ter pelo menos ${SENHA_MIN_LENGTH} caracteres.`,
      });
    }

    if (!validarEmailInstitucional(email, tipo)) {
      return res.status(400).json({
        erro:
          tipo === 'aluno'
            ? 'E-mail inválido: alunos devem usar o e-mail institucional @alunos.ifsuldeminas.edu.br.'
            : 'E-mail inválido: monitores e administradores devem usar o e-mail institucional @ifsuldeminas.edu.br.',
      });
    }

    const senhaHash = await hashPassword(senha);
    const usuario = await createUsuario({ nome, email, ra_siape_cpf, ano_turma, tipo }, senhaHash);

    return res.status(201).json({ usuario });
  } catch (error) {
    // Código 23505 = violação de UNIQUE no Postgres (e-mail ou ra_siape_cpf já cadastrado)
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'E-mail ou RA/SIAPE/CPF já cadastrado.' });
    }

    console.error('[IF-Ajuda] Erro ao registrar usuário:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
  }
}

/**
 * POST /auth/login
 * Valida e-mail/senha e, se corretos, retorna um token JWT (24h) junto
 * com os dados públicos e acadêmicos do perfil (nome, ra_siape_cpf,
 * ano_turma, foto_perfil, etc.) para o cliente usar no painel.
 */
export async function login(req, res) {
  try {
    const { email, senha } = req.body ?? {};

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const usuario = await findUsuarioByEmailRaw(email);

    // Mensagem genérica de propósito: não revela se o e-mail existe ou não
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaCorreta = await comparePassword(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = generateToken({ id: usuario.id, tipo: usuario.tipo }, '24h');

    return res.status(200).json({
      token,
      usuario: sanitizeUsuario(usuario),
    });
  } catch (error) {
    console.error('[IF-Ajuda] Erro ao fazer login:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
}

export default { registrar, login };
