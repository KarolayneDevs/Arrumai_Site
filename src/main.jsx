import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

// Os estilos são importados aqui, uma vez, e valem para o site todo.
// A ORDEM importa: variáveis primeiro, porque os outros arquivos usam elas.
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

/* =====================================================================
   PONTO DE ENTRADA: é aqui que o React "liga" o site na div#root.
   Camadas de fora para dentro:
   - StrictMode:    ajuda a achar problemas durante o desenvolvimento
   - BrowserRouter: habilita a navegação entre páginas
   - AuthProvider:  compartilha quem está logado com todo o site
   ===================================================================== */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
