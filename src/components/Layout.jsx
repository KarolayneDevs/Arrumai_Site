import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/* =====================================================================
   LAYOUT PADRÃO
   Toda página do site aparece entre o cabeçalho e o rodapé.
   O <Outlet /> é o "buraco" onde o React Router encaixa a página atual.
   ===================================================================== */
export default function Layout() {
  return (
    <div className="layout">
      {/* Link escondido que aparece ao apertar Tab: pula direto para o conteúdo */}
      <a href="#conteudo" className="pular-para-conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo" className="layout__conteudo">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
