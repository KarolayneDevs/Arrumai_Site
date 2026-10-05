import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Botao from '../../components/Botao';
import '../../styles/auth.css';

/* =====================================================================
   ENTRAR (RF01)
   O cadastro agora tem tela própria: veja pages/auth/Cadastro.jsx.

   ATENÇÃO: o backend ainda não tem login. Aqui o envio só "finge" entrar.
   Quando a API de login existir, troque o trecho marcado com TODO: ela
   deve devolver o nome, o e-mail e o PAPEL da pessoa (cliente, equipe ou
   admin). O papel precisa vir do servidor, nunca do próprio site.
   ===================================================================== */

// SÓ PARA TESTAR O PAINEL ENQUANTO NÃO HÁ LOGIN DE VERDADE.
// Funciona apenas com "npm run dev" (import.meta.env.DEV). Na versão
// publicada (npm run build) esta lista é ignorada.
const ADMINS_DE_TESTE = ['admin@arrumai.com.br'];

export default function Login() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [dados, setDados] = useState({ email: '', senha: '' });
  const [erros, setErros] = useState({});

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

  function aoEnviar(evento) {
    evento.preventDefault(); // impede a página de recarregar
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // TODO: trocar por chamada à API (POST /login). A senha vai para o
    // servidor, que a confere com a versão criptografada (RNF02).
    const email = dados.email.trim().toLowerCase();
    const ehAdminDeTeste = import.meta.env.DEV && ADMINS_DE_TESTE.includes(email);
    const papel = ehAdminDeTeste ? 'admin' : 'cliente';

    entrar({ nome: email.split('@')[0], email, papel });

    // A equipe vai para o painel; cliente não deve retornar a uma rota exclusiva da equipe.
    const destino = papel === 'admin'
      ? '/admin'
      : local.state?.de && !local.state.de.startsWith('/admin')
        ? local.state.de
        : '/';
    navegar(destino, { replace: true });
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
          <input id="senha" name="senha" type="password" autoComplete="current-password" value={dados.senha} onChange={aoDigitar} />
          {erros.senha && <span className="erro">{erros.senha}</span>}
        </div>

        <Botao type="submit" className="botao--cheio">Entrar</Botao>
      </form>

      <p className="troca-modo">
        Ainda não tem conta? <Link to="/cadastro" state={local.state}>Criar conta</Link>
      </p>

      {/* Aviso que só aparece no modo de desenvolvimento */}
      {import.meta.env.DEV && (
        <p className="aviso-dev">
          Modo de teste: para abrir o painel da equipe, entre com <strong>admin@arrumai.com.br</strong> e
          qualquer senha de 8 caracteres.
        </p>
      )}
    </div>
  );
}