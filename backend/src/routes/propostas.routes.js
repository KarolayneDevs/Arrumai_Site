import { Router } from 'express';
import { listarPropostas, criar, atualizarStatus } from '../controllers/propostasController.js';

// -----------------------------------------------------------------------------
// ROTAS DE PROPOSTAS
// -----------------------------------------------------------------------------
// A equipe usa essas rotas para criar proposta e o cliente para aceitar ou
// recusar a oferta.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/solicitacoes/:id/propostas', listarPropostas);
router.post('/solicitacoes/:id/propostas', criar);
router.patch('/propostas/:id/status', atualizarStatus);

export default router;
