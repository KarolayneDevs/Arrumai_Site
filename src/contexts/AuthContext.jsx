import { createContext, useContext, useState } from 'react';

/* =====================================================================
   CONTEXTO DE LOGIN (RF01: criar conta e fazer login)
   Um "contexto" é um jeito de compartilhar informação com todos os
   componentes sem passar de mão em mão. Aqui compartilhamos: quem está logado.

   ATENÇÃO: por enquanto o login é de mentira (não há back-end). Guardamos
   só o nome e o e-mail no navegador. Quando a API existir, o login deve
   receber um token do servidor. Senhas NUNCA devem ser guardadas aqui (RNF02).
   ===================================================================== */
const AuthContext = createContext(null);
const CHAVE = 'arrumai:usuario';
const CHAVE_TOKEN = 'arrumai:token';

export function AuthProvider({ children }) {
  // A função passada ao useState roda só uma vez, ao abrir o site:
  // tenta recuperar o usuário salvo (assim o login continua após recarregar a página).
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE));
    } catch {
      return null; // se o dado estiver corrompido, começa deslogada
    }
  });

  /** Registra a sessao devolvida pelo backend. */
  function entrar(dados, token) {
    setUsuario(dados);
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    localStorage.setItem(CHAVE_TOKEN, token);
  }

  /** Desloga e apaga o que foi salvo. */
  function sair() {
    setUsuario(null);
    localStorage.removeItem(CHAVE);
    localStorage.removeItem(CHAVE_TOKEN);
  }

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>;
}

/** Atalho para qualquer componente ler o login: const { usuario } = useAuth(); */
export function useAuth() {
  return useContext(AuthContext);
}
