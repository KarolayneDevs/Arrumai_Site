import { cadastrar, entrar } from '../services/authService.js';

// Controllers traduzem requisicoes HTTP para chamadas do service de auth.
export async function cadastrarUsuario(req, res) {
  try {
    const usuario = await cadastrar(req.body || {});
    return res.status(201).json({ message: 'Conta criada com sucesso.', usuario });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function fazerLogin(req, res) {
  try {
    const resultado = await entrar(req.body?.email, req.body?.senha);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}