import { obterSessao } from '../services/authService.js';

export function exigirAutenticacao(req, res, next) {
  const cabecalho = String(req.headers.authorization || '');
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : '';
  const sessao = obterSessao(token);

  if (!sessao) {
    return res.status(401).json({ message: 'É necessário estar autenticado.' });
  }

  req.usuario = sessao;
  return next();
}
