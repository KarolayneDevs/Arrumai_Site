import express from 'express';
import cors from 'cors';
import servicosRoutes from './routes/servicos.routes.js';
import solicitacoesRoutes from './routes/solicitacoes.routes.js';
import { testConnection } from './config/database.js';

// -----------------------------------------------------------------------------
// APP EXPRESS
// -----------------------------------------------------------------------------
// Aqui montamos a aplicação principal. A ideia é separar bem as rotas e deixar
// a API pronta para crescer conforme o projeto evolui.
// -----------------------------------------------------------------------------

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', async (_req, res) => {
  const status = await testConnection();

  res.status(200).json({
    ok: true,
    message: 'API do ARRUMAI funcionando.',
    database: status,
  });
});

app.use('/api', servicosRoutes);
app.use('/api', solicitacoesRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada.',
    rota: req.originalUrl,
  });
});

export default app;
