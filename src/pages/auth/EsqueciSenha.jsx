import { useState } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../components/Botao';
import { apiFetch } from '../../services/api';
import '../../styles/auth.css';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setResultado(null);
    setEnviando(true);
    try {
      const resposta = await apiFetch('/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setResultado(resposta);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const linkDev = resultado?.resetToken
    ? `/redefinir-senha?token=${encodeURIComponent(resultado.resetToken)}`
    : '';

  return (
    <div className="container pagina-estreita">
      <h1>Esqueci minha senha</h1>
      <p className="lead">Informe seu e-mail e enviaremos as instruções para criar uma nova senha.</p>

      <form className="cartao" onSubmit={aoEnviar} noValidate>
        <div className={`campo ${erro ? 'campo--erro' : ''}`}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>
        <Botao type="submit" className="botao--cheio" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Continuar'}
        </Botao>
        {erro && <p className="erro" role="alert">{erro}</p>}
        {resultado && (
          <div className="mensagem-sucesso" role="status">
            <p>{resultado.message}</p>
            {linkDev && (
              <p className="aviso-dev">
                Ambiente de desenvolvimento: <Link to={linkDev}>abrir link de recuperação</Link>
              </p>
            )}
          </div>
        )}
      </form>

      <p className="troca-modo"><Link to="/entrar">Voltar para entrar</Link></p>
    </div>
  );
}
