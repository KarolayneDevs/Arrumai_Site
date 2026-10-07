import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Botao from '../../components/Botao';
import '../../styles/auth.css';
import { apiFetch } from '../../services/api';
import Icone from '../../components/Icone';

/* =====================================================================
   ENTRAR (RF01)
   O cadastro agora tem tela própria: veja pages/auth/Cadastro.jsx.

  O backend devolve o usuario e o token da sessao. O papel vem do servidor,
  nunca do formulario ou de uma regra no navegador.
   ===================================================================== */

export default function Login() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [dados, setDados] = useState({ email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [verSenha, setVerSenha] = useState(false);

  /** Atualiza o campo digitado (usa o "name" do input como chave). */
  function aoDigitar(evento) {
    const { name, value } = evento.target;
    setDados({ ...dados, [name]: value });
  }

  function validar() {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) e.email = 'Informe um e-mail válido, como nome@email.com.';
    if (dados.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.';
    return e;
  }

  async function aoEnviar(evento) {
    evento.preventDefault(); // impede a página de recarregar
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    setErroApi('');
    try {
      const resposta = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      entrar(resposta.usuario, resposta.token);

      const destino = resposta.usuario.papel === 'admin'
        ? '/admin'
        : local.state?.de && !local.state.de.startsWith('/admin')
          ? local.state.de
          : '/';
      navegar(destino, { replace: true });
    } catch (error) {
      setErroApi(error.message);
    }
  }

  return (
    <div className="container pagina-estreita">
      <h1>Entrar</h1>
      <p className="lead">Acompanhe suas solicitações e fale com a equipe.</p>

      {/* noValidate: quem valida somos nós, com mensagens em português */}
      <form className="cartao" onSubmit={aoEnviar} noValidate>
        <div className={`campo ${erros.email ? 'campo--erro' : ''}`}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" value={dados.email} onChange={aoDigitar} />
          {erros.email && <span className="erro">{erros.email}</span>}
        </div>

        <div className={`campo ${erros.senha ? 'campo--erro' : ''}`}>
          <label htmlFor="senha">Senha</label>
          <div className="campo-senha">
            <input id="senha" name="senha" type={verSenha ? 'text' : 'password'} autoComplete="current-password" value={dados.senha} onChange={aoDigitar} />
            <button type="button" className="campo-senha__botao" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'} title={verSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              <Icone nome={verSenha ? 'olhoFechado' : 'olho'} tamanho={21} />
            </button>
          </div>
          {erros.senha && <span className="erro">{erros.senha}</span>}
        </div>

        <Botao type="submit" className="botao--cheio">Entrar</Botao>
      </form>

      <p className="troca-modo">
        Ainda não tem conta? <Link to="/cadastro" state={local.state}>Criar conta</Link>
      </p>

      {erroApi && <p className="erro" role="alert">{erroApi}</p>}
    </div>
  );
}