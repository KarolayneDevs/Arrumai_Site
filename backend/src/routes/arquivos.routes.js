import { Router } from 'express';
import { listarArquivos, criar, visualizar } from '../controllers/arquivosController.js';
import { upload, uploadComprovante } from '../config/upload.js';

// -----------------------------------------------------------------------------
// ROTAS DE ARQUIVOS
// -----------------------------------------------------------------------------
// Os documentos e comprovantes ficam em disco para não sobrecarregar o banco.
// A rota aceita tanto JSON quanto multipart/form-data para manter compatibilidade
// com testes antigos e com o fluxo de upload real do front.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/arquivos/:id/visualizar', visualizar);
router.get('/solicitacoes/:id/arquivos', listarArquivos);
router.post('/solicitacoes/:id/arquivos', upload.single('arquivo'), criar);
router.post('/solicitacoes/:id/comprovantes', uploadComprovante.single('comprovante'), criar);

export default router;
