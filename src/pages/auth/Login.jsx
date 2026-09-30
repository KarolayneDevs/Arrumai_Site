import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Botao from '../../components/Botao';

/* =====================================================================
   ENTRAR / CRIAR CONTA (RF01)
   Uma tela só, com dois modos: "entrar" e "cadastro".
   Cliente pode ser pessoa ou empresa (documento de requisitos).
   ATENÇÃO: sem back-end, o envio só "finge" o login. Procure por TODO.
   ===================================================================== */
export default function Login() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [modo, setModo] = useState('entrar'); // 'entrar' ou 'cadastro'
  // Um objeto guarda todos os campos; "campo" muda só o que o usuário digitou
  const [dados, setDados] = useState({ nome: '', email: '', tipo: 'pessoa', senha: '', aceite: false });
  const [erros, setErros] = useState({});

  /** Atualiza um campo. Serve para todos: usa o "name" do input como chave. */
  function aoDigitar(evento) {
    const { name, value, type, checked } = evento.target;
    setDados({ ...dados, [name]: type === 'checkbox' ? checked : value });
  }

  /** Confere os campos e devolve um objeto com as mensagens de erro. */
  function validar() {
    const e = {};
    if (modo === 'cadastro' && dados.nome.trim().length < 3) e.nome = 'Informe seu nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) e.email = 'Informe um e-mail válido, como nome@email.com.';
    if (dados.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.';
    // LGPD (RNF03): o cadastro só segue com o aceite do tratamento de dados
    if (modo === 'cadastro' && !dados.aceite) e.aceite = 'Marque a caixa para criar sua conta.';
    return e;
  }

  function aoEnviar(evento) {
    evento.preventDefault(); // impede a página de recarregar
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return; // tem erro: para aqui

    // TODO: trocar por chamada à API (POST /login ou POST /usuarios).
    // A senha vai para o servidor, que deve guardá-la criptografada (RNF02).
    entrar({ nome: dados.nome || dados.email.split('@')[0], email: dados.email });

    // Volta para a página que ela queria abrir (veja RotaProtegida) ou vai para a lista
    navegar(local.state?.de ?? '/minhas-solicitacoes', { replace: true });
  }

  return (
    <div className="container pagina-estreita">
      <h1>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
      <p className="lead">
        {modo === 'entrar'
          ? 'Acompanhe suas solicitações e fale com a equipe.'
          : 'Leva menos de um minuto. Depois é só enviar seu arquivo.'}
      </p>

      {/* noValidate: quem valida somos nós, com mensagens em português */}
      <form className="cartao" onSubmit={aoEnviar} noValidate>
        {modo === 'cadastro' && (
          <>
            <div className={`campo ${erros.nome ? 'campo--erro' : ''}`}>
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" name="nome" type="text" autoComplete="name" value={dados.nome} onChange={aoDigitar} />
              {erros.nome && <span className="erro">{erros.nome}</span>}
            </div>

            <div className="campo">
              <label htmlFor="tipo">Você é</label>
              <select id="tipo" name="tipo" value={dados.tipo} onChange={aoDigitar}>
                <option value="pessoa">Pessoa</option>
                <option value="empresa">Empresa ou instituição</option>
              </select>
            </div>
          </>
        )}

        <div className={`campo ${erros.email ? 'campo--erro' : ''}`}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" value={dados.email} onChange={aoDigitar} />
          {erros.email && <span className="erro">{erros.email}</span>}
        </div>

        <div className={`campo ${erros.senha ? 'campo--erro' : ''}`}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha" name="senha" type="password"
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={dados.senha} onChange={aoDigitar}
          />
          {erros.senha && <span className="erro">{erros.senha}</span>}
        </div>

        {modo === 'cadastro' && (
          <div className={`campo campo--check ${erros.aceite ? 'campo--erro' : ''}`}>
            <label>
              <input type="checkbox" name="aceite" checked={dados.aceite} onChange={aoDigitar} />{' '}
              Concordo que meus dados e documentos sejam tratados para prestar o serviço, conforme a LGPD.
            </label>
            {erros.aceite && <span className="erro">{erros.aceite}</span>}
          </div>
        )}

        <Botao type="submit" className="botao--cheio">
          {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </Botao>
      </form>

      {/* Alterna entre os dois modos e limpa os erros do modo anterior */}
      <p className="troca-modo">
        {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
        <button
          type="button"
          className="botao botao--texto"
          onClick={() => { setModo(modo === 'entrar' ? 'cadastro' : 'entrar'); setErros({}); }}
        >
          {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </div>
  );
}
