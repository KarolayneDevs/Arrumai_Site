import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Botao from '../../components/Botao';
import '../../styles/auth.css';
import { apiFetch } from '../../services/api';
import Icone from '../../components/Icone';

/* =====================================================================
   CRIAR CONTA (RF01)
   O cliente pode ser pessoa ou empresa (documento de requisitos).
   Campos: tipo de conta, nome, e-mail, telefone (opcional), senha,
   confirmação de senha e aceite da LGPD (RNF03).

  O formulario envia os dados para a API, que valida o aceite LGPD e guarda
  somente o hash da senha no MySQL.
   ===================================================================== */

const ESTADO_INICIAL = {
  tipo: 'pessoa',       // 'pessoa' ou 'empresa'
  nome: '',
  email: '',
  telefone: '',
  cnpj: '',             // só usado quando tipo === 'empresa' (opcional)
  senha: '',
  confirmarSenha: '',
  aceite: false,
};

/** Deixa só os números de um texto: "12.345-6" -> "123456". */
const soNumeros = (texto) => texto.replace(/\D/g, '');

export default function Cadastro() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [verSenha, setVerSenha] = useState(false); // mostra/esconde a senha

  const empresa = dados.tipo === 'empresa';

  /** Atualiza um campo. Serve para todos: usa o "name" do input como chave. */
  function aoDigitar(evento) {
    const { name, value, type, checked } = evento.target;
    setDados({ ...dados, [name]: type === 'checkbox' ? checked : value });
  }

  /** Confere os campos e devolve um objeto com as mensagens de erro. */
  function validar() {
    const e = {};

    if (dados.nome.trim().length < 3) {
      e.nome = empresa ? 'Informe o nome da empresa ou instituição.' : 'Informe seu nome completo.';
    }
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) {
      e.email = 'Informe um e-mail válido, como nome@email.com.';
    }
    // Telefone é opcional, mas se vier preenchido precisa ter DDD + número (10 ou 11 dígitos)
    if (dados.telefone && ![10, 11].includes(soNumeros(dados.telefone).length)) {
      e.telefone = 'Informe o DDD e o número, como (92) 99999-0000.';
    }
    // CNPJ é opcional, mas se vier preenchido precisa ter 14 dígitos
    if (empresa && dados.cnpj && soNumeros(dados.cnpj).length !== 14) {
      e.cnpj = 'O CNPJ tem 14 números.';
    }
    if (dados.senha.length < 8) {
      e.senha = 'A senha precisa ter pelo menos 8 caracteres.';
    } else if (!/\d/.test(dados.senha) || !/[A-Za-z]/.test(dados.senha)) {
      e.senha = 'Misture letras e números para a senha ficar mais segura.';
    }
    if (dados.confirmarSenha !== dados.senha) {
      e.confirmarSenha = 'As senhas não são iguais.';
    }
    // LGPD (RNF03): o cadastro só segue com o aceite do tratamento de dados
    if (!dados.aceite) {
      e.aceite = 'Marque a caixa para criar sua conta.';
    }
    return e;
  }

  async function aoEnviar(evento) {
    evento.preventDefault(); // impede a página de recarregar
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return; // tem erro: para aqui

    setErroApi('');
    try {
      const resposta = await apiFetch('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({
          tipo: dados.tipo,
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          cnpj: dados.cnpj,
          senha: dados.senha,
          aceite: dados.aceite,
        }),
      });
      const login = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: dados.email, senha: dados.senha }),
      });
      entrar(login.usuario, login.token);
      navegar(local.state?.de ?? '/minhas-solicitacoes', { replace: true });
    } catch (error) {
      setErroApi(error.message);
    }
  }

  return (
    <div className="container pagina-estreita">
      <h1>Criar conta</h1>
      <p className="lead">Leva menos de um minuto. Depois é só enviar seu arquivo.</p>

      <form className="cartao" onSubmit={aoEnviar} noValidate>
        {/* --- Tipo de conta: dois cartões marcáveis --- */}
        <fieldset className="campo">
          <legend>Você é</legend>
          <div className="opcoes opcoes--2">
            {[
              { valor: 'pessoa', titulo: 'Pessoa', texto: 'Estudante, pesquisador ou profissional.' },
              { valor: 'empresa', titulo: 'Empresa ou instituição', texto: 'Escola, faculdade, empresa ou secretaria.' },
            ].map((o) => (
              <label key={o.valor} className={`opcao ${dados.tipo === o.valor ? 'opcao--marcada' : ''}`}>
                <input type="radio" name="tipo" value={o.valor} checked={dados.tipo === o.valor} onChange={aoDigitar} />
                <strong>{o.titulo}</strong>
                <small>{o.texto}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={`campo ${erros.nome ? 'campo--erro' : ''}`}>
          <label htmlFor="nome">{empresa ? 'Nome da empresa ou instituição' : 'Nome completo'}</label>
          <input id="nome" name="nome" type="text" autoComplete={empresa ? 'organization' : 'name'} value={dados.nome} onChange={aoDigitar} />
          {erros.nome && <span className="erro">{erros.nome}</span>}
        </div>

        {/* CNPJ só aparece para empresas */}
        {empresa && (
          <div className={`campo ${erros.cnpj ? 'campo--erro' : ''}`}>
            <label htmlFor="cnpj">CNPJ (opcional)</label>
            <input id="cnpj" name="cnpj" type="text" inputMode="numeric" placeholder="00.000.000/0000-00" value={dados.cnpj} onChange={aoDigitar} />
            {erros.cnpj && <span className="erro">{erros.cnpj}</span>}
          </div>
        )}

        {/* E-mail e telefone lado a lado no computador, um embaixo do outro no celular */}
        <div className="campos-linha">
          <div className={`campo ${erros.email ? 'campo--erro' : ''}`}>
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" value={dados.email} onChange={aoDigitar} />
            {erros.email && <span className="erro">{erros.email}</span>}
          </div>

          <div className={`campo ${erros.telefone ? 'campo--erro' : ''}`}>
            <label htmlFor="telefone">Telefone ou WhatsApp (opcional)</label>
            <input id="telefone" name="telefone" type="tel" autoComplete="tel" placeholder="(92) 99999-0000" value={dados.telefone} onChange={aoDigitar} />
            {erros.telefone && <span className="erro">{erros.telefone}</span>}
          </div>
        </div>

        <div className="campos-linha">
          <div className={`campo ${erros.senha ? 'campo--erro' : ''}`}>
            <label htmlFor="senha">Senha</label>
            <div className="campo-senha">
              <input id="senha" name="senha" type={verSenha ? 'text' : 'password'} autoComplete="new-password" value={dados.senha} onChange={aoDigitar} />
              <button type="button" className="campo-senha__botao" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? 'Ocultar senhas' : 'Mostrar senhas'} title={verSenha ? 'Ocultar senhas' : 'Mostrar senhas'}>
                <Icone nome={verSenha ? 'olhoFechado' : 'olho'} tamanho={21} />
              </button>
            </div>
            <small>Mínimo de 8 caracteres, com letras e números.</small>
            {erros.senha && <span className="erro">{erros.senha}</span>}
          </div>

          <div className={`campo ${erros.confirmarSenha ? 'campo--erro' : ''}`}>
            <label htmlFor="confirmarSenha">Repita a senha</label>
            <div className="campo-senha">
              <input id="confirmarSenha" name="confirmarSenha" type={verSenha ? 'text' : 'password'} autoComplete="new-password" value={dados.confirmarSenha} onChange={aoDigitar} />
              <button type="button" className="campo-senha__botao" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? 'Ocultar senhas' : 'Mostrar senhas'} title={verSenha ? 'Ocultar senhas' : 'Mostrar senhas'}>
                <Icone nome={verSenha ? 'olhoFechado' : 'olho'} tamanho={21} />
              </button>
            </div>
            {erros.confirmarSenha && <span className="erro">{erros.confirmarSenha}</span>}
          </div>
        </div>

        <div className={`campo campo--check ${erros.aceite ? 'campo--erro' : ''}`}>
          <label>
            <input type="checkbox" name="aceite" checked={dados.aceite} onChange={aoDigitar} />{' '}
            Concordo que meus dados e documentos sejam tratados para prestar o serviço, conforme a LGPD.
          </label>
          {erros.aceite && <span className="erro">{erros.aceite}</span>}
        </div>

        <Botao type="submit" className="botao--cheio">Criar conta</Botao>
      </form>

      <p className="troca-modo">
        Já tem conta? <Link to="/entrar" state={local.state}>Entrar</Link>
      </p>
      {erroApi && <p className="erro" role="alert">{erroApi}</p>}
    </div>
  );
}