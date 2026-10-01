import { Router } from 'express';
import { listarArquivos, criar } from '../controllers/arquivosController.js';

// -----------------------------------------------------------------------------
// ROTAS DE ARQUIVOS
// -----------------------------------------------------------------------------
// Aqui ficam os endpoints para anexar documentos ou comprovantes da solicitação.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/solicitacoes/:id/arquivos', listarArquivos);
router.post('/solicitacoes/:id/arquivos', criar);

export default router;
