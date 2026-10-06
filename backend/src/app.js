import express from 'express';
import cors from 'cors';
import servicosRoutes from './routes/servicos.routes.js';
import solicitacoesRoutes from './routes/solicitacoes.routes.js';
import propostasRoutes from './routes/propostas.routes.js';
import pagamentosRoutes from './routes/pagamentos.routes.js';
import arquivosRoutes from './routes/arquivos.routes.js';
import authRoutes from './routes/auth.routes.js';
import { testConnection } from './config/database.js';

// -----------------------------------------------------------------------------
// APP EXPRESS
// -----------------------------------------------------------------------------
// Este arquivo centraliza a inicialização da API. Ele monta o middleware,
// expõe o endpoint de saúde e conecta todas as rotas do backend.
// A organização segue um padrão simples: rota -> controller -> service.
// -----------------------------------------------------------------------------

const app = express();

// Middleware de segurança e parsing do payload JSON.
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Endpoint de verificação da API e do banco.
app.get('/api/health', async (_req, res) => {
  const status = await testConnection();

  res.status(200).json({
    ok: true,
    message: 'API do ARRUMAI funcionando.',
    database: status,
  });
});

// Rotas principais do sistema.
app.use('/api', servicosRoutes);
app.use('/api', solicitacoesRoutes);
app.use('/api', propostasRoutes);
app.use('/api', pagamentosRoutes);
app.use('/api', arquivosRoutes);
app.use('/api/auth', authRoutes);

// Tratamento padrão para rota inexistente.
app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada.',
    rota: req.originalUrl,
  });
});

export default app;
