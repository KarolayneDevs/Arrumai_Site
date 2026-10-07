import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Botao from '../../components/Botao';
import { apiFetch } from '../../services/api';
import '../../styles/auth.css';

export default function RedefinirSenha() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [concluida, setConcluida] = useState(false);
  const token = parametros.get('token') || '';

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    if (senha !== confirmacao) {
      setErro('As senhas precisam ser iguais.');
      return;
    }
    setEnviando(true);
    try {
      await apiFetch('/auth/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ token, senha }),
      });
      setConcluida(true);
      setTimeout(() => navegar('/entrar', { replace: true }), 1800);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <div className="container pagina-estreita">
        <h1>Link inválido</h1>
        <p className="lead">Solicite uma nova recuperação de senha para continuar.</p>
        <Link to="/esqueci-senha" className="botao botao--principal">Solicitar recuperação</Link>
      </div>
    );
  }

  return (
    <div className="container pagina-estreita">
      <h1>Criar nova senha</h1>
      <p className="lead">Escolha uma senha com pelo menos 8 caracteres, contendo letras e números.</p>
      <form className="cartao" onSubmit={aoEnviar} noValidate>
        <div className="campo">
          <label htmlFor="senha">Nova senha</label>
          <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(evento) => setSenha(evento.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="confirmacao">Confirmar nova senha</label>
          <input id="confirmacao" type="password" autoComplete="new-password" value={confirmacao} onChange={(evento) => setConfirmacao(evento.target.value)} required />
        </div>
        <Botao type="submit" className="botao--cheio" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Redefinir senha'}
        </Botao>
        {erro && <p className="erro" role="alert">{erro}</p>}
        {concluida && <p className="mensagem-sucesso" role="status">Senha redefinida. Redirecionando para o login...</p>}
      </form>
    </div>
  );
}
