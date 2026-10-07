import { cadastrar, entrar, redefinirSenha, solicitarRecuperacao } from '../services/authService.js';
import { emailRecuperacaoConfigurado, enviarEmailRecuperacao } from '../services/emailService.js';

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

export async function solicitarRecuperacaoSenha(req, res) {
  try {
    const resultado = await solicitarRecuperacao(req.body?.email);
    const resposta = {
      message: 'Se este e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.',
    };

    if (resultado.encontrado) {
      const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${encodeURIComponent(resultado.token)}`;

      if (emailRecuperacaoConfigurado()) {
        await enviarEmailRecuperacao(req.body.email.trim(), link);
      } else if (process.env.NODE_ENV !== 'production') {
        // Permite testar localmente enquanto o SMTP ainda não foi configurado.
        resposta.resetToken = resultado.token;
      } else {
        throw new Error('O serviço de e-mail não está configurado.');
      }
    }

    return res.status(200).json(resposta);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function redefinirSenhaUsuario(req, res) {
  try {
    await redefinirSenha(req.body?.token, req.body?.senha);
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}