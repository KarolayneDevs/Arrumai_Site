import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import RotaProtegida from './RotaProtegida';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Cadastro from '../pages/auth/Cadastro';
import NovaSolicitacao from '../pages/cliente/NovaSolicitacao';
import MinhasSolicitacoes from '../pages/cliente/MinhasSolicitacoes';
import DetalheSolicitacao from '../pages/cliente/DetalheSolicitacao';
import NaoEncontrada from '../pages/NaoEncontrada';

/* =====================================================================
   MAPA DE PÁGINAS (ROTAS)
   Cada <Route> liga um endereço a uma página.
   - Rotas dentro de <Layout> aparecem com cabeçalho e rodapé.
   - Rotas dentro de <RotaProtegida> exigem que a pessoa esteja logada.
   ===================================================================== */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Só para clientes logadas */}
        <Route element={<RotaProtegida />}>
          <Route path="/nova-solicitacao" element={<NovaSolicitacao />} />
          <Route path="/minhas-solicitacoes" element={<MinhasSolicitacoes />} />
          {/* ":id" muda conforme o endereço: /solicitacao/0231, /solicitacao/0232... */}
          <Route path="/solicitacao/:id" element={<DetalheSolicitacao />} />
        </Route>

        {/* "*" pega qualquer endereço que não existe */}
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}
