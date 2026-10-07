import {
  listarSolicitacoes,
  buscarSolicitacaoPorId,
  criarSolicitacao,
  atualizarStatusSolicitacao,
  adicionarComentario,
  listarComentariosPorSolicitacao,
  listarHistoricoPorSolicitacao,
  excluirSolicitacao,
} from '../services/solicitacoesService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE SOLICITAÇÕES
// -----------------------------------------------------------------------------
// Este arquivo recebe as requisições da tela de nova solicitação, da lista de
// solicitações e do detalhe do pedido. Toda a regra de negócio foi deixada no
// service para manter o código organizado e fácil de evoluir.
// -----------------------------------------------------------------------------

export async function listar(req, res) {
  try {
    const solicitacoes = await listarSolicitacoes(req.usuario);
    return res.status(200).json(solicitacoes);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar solicitações.', detalhe: error.message });
  }
}

export async function buscarPorId(req, res) {
  try {
    const solicitacao = await buscarSolicitacaoPorId(req.params.id, req.usuario);

    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação não encontrada.' });
    }

    return res.status(200).json(solicitacao);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar solicitação.', detalhe: error.message });
  }
}

export async function criar(req, res) {
  try {
    const novaSolicitacao = await criarSolicitacao(req.body || {}, req.usuario);
    return res.status(201).json({ message: 'Solicitação criada com sucesso.', data: novaSolicitacao });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function atualizarStatus(req, res) {
  try {
    const solicitacaoAtualizada = await atualizarStatusSolicitacao(req.params.id, req.body.status, req.body.observacao, req.usuario);
    return res.status(200).json({ message: 'Status atualizado com sucesso.', data: solicitacaoAtualizada });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function comentar(req, res) {
  try {
    const comentario = await adicionarComentario(req.params.id, req.body || {}, req.usuario);
    return res.status(201).json({ message: 'Comentário enviado com sucesso.', data: comentario });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function listarComentarios(req, res) {
  try {
    const comentarios = await listarComentariosPorSolicitacao(req.params.id, req.usuario);
    return res.status(200).json(comentarios);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar comentários.', detalhe: error.message });
  }
}

export async function listarHistorico(req, res) {
  try {
    const historico = await listarHistoricoPorSolicitacao(req.params.id, req.usuario);
    return res.status(200).json(historico);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar histórico.', detalhe: error.message });
  }
}

export async function excluir(req, res) {
  try {
    await excluirSolicitacao(req.params.id, req.usuario);
    return res.status(204).send();
  } catch (error) {
    const status = error.message === 'Solicitação não encontrada.' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
