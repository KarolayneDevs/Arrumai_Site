import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* =====================================================================
   ROTA DA EQUIPE (só para quem é "admin" ou "equipe")
  - Sem login ou cliente comum: volta para a página inicial.
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
    return <Navigate to="/entrar" state={{ de: local.pathname + local.search }} replace />;
  }

  if (!PAPEIS_DA_EQUIPE.includes(usuario.papel)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}