import { Router } from 'express';
import { listarPagamentos, criar, atualizarStatus } from '../controllers/pagamentosController.js';

// -----------------------------------------------------------------------------
// ROTAS DE PAGAMENTO
// -----------------------------------------------------------------------------
// O cliente registra o método e o comprovante. A equipe confirma a receita.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/solicitacoes/:id/pagamentos', listarPagamentos);
router.post('/solicitacoes/:id/pagamentos', criar);
router.patch('/pagamentos/:id/status', atualizarStatus);

export default router;
