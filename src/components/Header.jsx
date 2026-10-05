import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import Botao from './Botao';

/* =====================================================================
   CABEÇALHO (fixo no topo)
   Logo à esquerda, menu no meio e botão "Pedir orçamento" à direita.
   No celular o menu vira um botão "Menu" que abre e fecha a lista.
   ===================================================================== */
export default function Header() {
  // useState guarda se o menu do celular está aberto (true) ou fechado (false)
  const [menuAberto, setMenuAberto] = useState(false);
  // usuario é null quando ninguém está logado
  const { usuario, sair } = useAuth();
  // A equipe e as administradoras ganham um link extra para o painel
  const ehEquipe = ['admin', 'equipe'].includes(usuario?.papel);
  // Fecha o menu depois de clicar em qualquer link (só faz diferença no celular)
  const fechar = () => setMenuAberto(false);

  return (
    <header className="cabecalho">
      <div className="container cabecalho__interno">
        <Link to="/" className="cabecalho__logo" aria-label="Arrumaí, página inicial" onClick={fechar}>
          <Logo tamanho={38} />
        </Link>

        {/* Botão que só aparece no celular */}
        <button
          type="button"
          className="cabecalho__menu-botao"
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? 'Fechar' : 'Menu'}
        </button>

        <nav
          id="menu-principal"
          className={`cabecalho__menu ${menuAberto ? 'cabecalho__menu--aberto' : ''}`}
          aria-label="Menu principal"
        >
          {/* Links com # levam a uma seção da página inicial.
              Usamos <a> comum (e não <Link>) porque eles precisam carregar a home
              e rolar até a seção. A mockup tem também "Preços", mas o valor de cada
              trabalho vem na proposta, então esse item ficou de fora. */}
          <a href="/#como-funciona" onClick={fechar}>Como funciona</a>
          <a href="/#servicos" onClick={fechar}>Serviços</a>
          <NavLink to="/minhas-solicitacoes" onClick={fechar}>Acompanhar</NavLink>
          {ehEquipe && <NavLink to="/admin" onClick={fechar}>Painel da equipe</NavLink>}
          {usuario ? (
            // Logada: mostra o nome e um botão para sair
            <span className="cabecalho__usuario">
              <span>Olá, {usuario.nome.split(' ')[0]}</span>
              <button type="button" className="botao botao--texto" onClick={() => { sair(); fechar(); }}>
                Sair
              </button>
            </span>
          ) : (
            <NavLink to="/entrar" onClick={fechar}>Entrar</NavLink>
          )}

          <Botao to="/nova-solicitacao" onClick={fechar}>Pedir orçamento</Botao>
        </nav>
      </div>
    </header>
  );
}
