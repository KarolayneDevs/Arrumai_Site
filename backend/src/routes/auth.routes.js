import { Router } from 'express';
import { cadastrarUsuario, fazerLogin } from '../controllers/authController.js';

// Rotas publicas para criar conta e iniciar uma sessao.
const router = Router();

router.post('/cadastro', cadastrarUsuario);
router.post('/login', fazerLogin);

export default router;