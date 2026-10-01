import { Router } from 'express';
import { listarServicos, criarServico } from '../controllers/servicosController.js';

// -----------------------------------------------------------------------------
// ROTAS DE SERVIÇOS
// -----------------------------------------------------------------------------
// Esta rota expõe a API do catálogo de serviços da plataforma. O front usa
// esses endpoints para listar os cards da home e os radio buttons de serviço.
// -----------------------------------------------------------------------------

const router = Router();

router.get('/servicos', listarServicos);
router.post('/servicos', criarServico);

export default router;
