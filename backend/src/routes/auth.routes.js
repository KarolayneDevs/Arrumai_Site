import { Router } from 'express';
import {
  cadastrarUsuario,
  fazerLogin,
  redefinirSenhaUsuario,
  solicitarRecuperacaoSenha,
} from '../controllers/authController.js';

// Rotas publicas para criar conta e iniciar uma sessao.
const router = Router();

router.post('/cadastro', cadastrarUsuario);
router.post('/login', fazerLogin);
router.post('/esqueci-senha', solicitarRecuperacaoSenha);
router.post('/redefinir-senha', redefinirSenhaUsuario);

export default router;