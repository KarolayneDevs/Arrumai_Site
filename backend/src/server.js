import app from './app.js';

// -----------------------------------------------------------------------------
// SERVIDOR DA API
// -----------------------------------------------------------------------------
// Este arquivo inicia o servidor Express e expõe a aplicação em uma porta simples.
// A porta pode ser configurada pelo .env, mas por padrão usamos 3001.
// -----------------------------------------------------------------------------

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
  console.log(`API ARRUMAI rodando em http://localhost:${PORT}`);
});
