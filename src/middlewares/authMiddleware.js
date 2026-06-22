/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/middlewares/authMiddleware.js
 * Middlewares de proteção da API (autenticação e autorização por papel)
 * e validação do domínio de e-mail institucional do IFSULDEMINAS.
 */

import { verifyToken } from '../services/auth.service.js';

/**
 * Middleware: verificarToken
 * Extrai o token do cabeçalho "Authorization: Bearer <token>", valida
 * usando a JWT_SECRET (via src/config/jwt.js) e injeta req.usuarioId e
 * req.usuarioTipo na requisição.
 *
 * Convenção: o token deve ter sido gerado com generateToken({ id, tipo }),
 * de forma que o payload decodificado tenha as chaves "id" e "tipo".
 */
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);

    // Aceita tanto { id, tipo } (padrão recomendado) quanto
    // { usuarioId, usuarioTipo }, para tolerar variações de payload.
    req.usuarioId = payload.id ?? payload.usuarioId;
    req.usuarioTipo = payload.tipo ?? payload.usuarioTipo;

    if (!req.usuarioId || !req.usuarioTipo) {
      return res.status(401).json({ erro: 'Token não contém os dados esperados do usuário.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

/**
 * Middleware factory: verificarPermissao
 * Recebe uma lista de tipos permitidos (ex: ['monitor', 'admin']) e
 * bloqueia com 403 caso req.usuarioTipo não esteja nessa lista.
 *
 * IMPORTANTE: deve ser usado SEMPRE depois de verificarToken na cadeia
 * de middlewares, pois depende de req.usuarioTipo já estar preenchido.
 *
 * Exemplo de uso numa rota:
 *   router.post('/monitorias', verificarToken, verificarPermissao(['monitor', 'admin']), criarMonitoria);
 *
 * @param {string[]} tiposPermitidos
 * @returns {import('express').RequestHandler}
 */
export function verificarPermissao(tiposPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuarioTipo || !tiposPermitidos.includes(req.usuarioTipo)) {
      return res.status(403).json({
        erro: 'Você não tem permissão para acessar este recurso.',
      });
    }
    next();
  };
}

// --- Validação de e-mail institucional -------------------------------

// Formato geral de e-mail (parte local estrita, sem espaços ou caracteres soltos)
const EMAIL_FORMATO_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

// Domínio institucional dos estudantes
const DOMINIO_ALUNO_REGEX = /@alunos\.ifsuldeminas\.edu\.br$/i;

// Domínio institucional de servidores/professores orientadores
const DOMINIO_SERVIDOR_REGEX = /@ifsuldeminas\.edu\.br$/i;

/**
 * Identifica a categoria institucional de um e-mail com base no domínio.
 * Útil para inferir o tipo de usuário a partir do e-mail no cadastro,
 * em vez de confiar apenas no valor enviado pelo cliente.
 * @param {string} email
 * @returns {'aluno' | 'servidor' | null}
 */
export function identificarDominioEmail(email) {
  const valor = String(email ?? '').trim();

  if (!EMAIL_FORMATO_REGEX.test(valor)) return null;
  if (DOMINIO_ALUNO_REGEX.test(valor)) return 'aluno';
  if (DOMINIO_SERVIDOR_REGEX.test(valor)) return 'servidor';
  return null;
}

/**
 * Valida se um e-mail é institucional e compatível com o tipo de usuário
 * informado no cadastro:
 *  - tipoUsuario === 'aluno'  -> exige @alunos.ifsuldeminas.edu.br
 *  - qualquer outro tipo (monitor, admin, professor orientador)
 *    -> exige @ifsuldeminas.edu.br
 *
 * @param {string} email
 * @param {string} tipoUsuario - 'aluno' | 'monitor' | 'admin'
 * @returns {boolean}
 */
export function validarEmailInstitucional(email, tipoUsuario) {
  const valor = String(email ?? '').trim();

  if (!EMAIL_FORMATO_REGEX.test(valor)) return false;

  if (tipoUsuario === 'aluno') {
    return DOMINIO_ALUNO_REGEX.test(valor);
  }

  // monitor, admin ou professor orientador -> domínio de servidores
  return DOMINIO_SERVIDOR_REGEX.test(valor);
}

export default {
  verificarToken,
  verificarPermissao,
  identificarDominioEmail,
  validarEmailInstitucional,
};
