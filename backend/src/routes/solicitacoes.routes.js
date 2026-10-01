import { Router } from 'express';
import {
  listar,
  buscarPorId,
  criar,
  atualizarStatus,
  comentar,
  listarComentarios,
  listarHistorico,
} from '../controllers/solicitacoesController.js';

// -----------------------------------------------------------------------------
// ROTAS DE SOLICITAÇÕES
// -----------------------------------------------------------------------------
// Essas rotas representam o fluxo real do cliente e da equipe dentro do sistema.
// Elas ajudam a ligar cada etapa do front aos endpoints da API.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/solicitacoes', listar);
router.get('/solicitacoes/:id', buscarPorId);
router.post('/solicitacoes', criar);
router.patch('/solicitacoes/:id/status', atualizarStatus);
router.post('/solicitacoes/:id/comentarios', comentar);
router.get('/solicitacoes/:id/comentarios', listarComentarios);
router.get('/solicitacoes/:id/historico', listarHistorico);

export default router;
