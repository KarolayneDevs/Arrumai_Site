import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* =====================================================================
   ROTA PROTEGIDA (RNF02: acesso só para quem está logada)
   Se não houver usuário logado, manda para a tela de login e guarda a
   página que ela queria abrir, para voltar para lá depois de entrar.
   ===================================================================== */
export default function RotaProtegida() {
  const { usuario } = useAuth();
  const local = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" state={{ de: local.pathname + local.search }} replace />;
  }
  return <Outlet />; // logada: mostra a página normalmente
}
