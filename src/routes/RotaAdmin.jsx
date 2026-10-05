import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Botao from '../components/Botao';

/* =====================================================================
   ROTA DA EQUIPE (só para quem é "admin" ou "equipe")
   - Sem login: manda para a tela de entrar.
   - Logada, mas cliente comum: mostra "Acesso restrito".
   - Equipe/admin: mostra a página normalmente.

   ATENÇÃO: isto só ESCONDE as telas. A segurança de verdade precisa estar
   no backend, que deve checar o papel do usuário em cada rota de
   administração (RNF02). Hoje o backend ainda não tem login.
   ===================================================================== */
const PAPEIS_DA_EQUIPE = ['admin', 'equipe'];

export default function RotaAdmin() {
  const { usuario } = useAuth();
  const local = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  }

  if (!PAPEIS_DA_EQUIPE.includes(usuario.papel)) {
    return (
      <div className="container pagina-estreita">
        <h1>Acesso restrito</h1>
        <p className="lead">Esta área é só para a equipe do Arrumaí.</p>
        <Botao to="/minhas-solicitacoes">Ver minhas solicitações</Botao>
      </div>
    );
  }

  return <Outlet />;
}