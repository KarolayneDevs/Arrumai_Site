import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* =====================================================================
  ROTA DO CLIENTE
  Sem sessão, envia para o login e guarda o destino. Contas de equipe/admin
  são encaminhadas ao painel, sem acesso às rotas de acompanhamento do cliente.
   ===================================================================== */
export default function RotaProtegida() {
  const { usuario } = useAuth();
  const local = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" state={{ de: local.pathname + local.search }} replace />;
  }

  if (['admin', 'equipe'].includes(usuario.papel)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
