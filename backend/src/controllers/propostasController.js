import {
  listarPropostasPorSolicitacao,
  criarProposta,
  atualizarStatusProposta,
} from '../services/propostasService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE PROPOSTAS
// -----------------------------------------------------------------------------
// Os endpoints aqui conectam a tela de proposta ao service responsável pela
// regra de negócio.
// -----------------------------------------------------------------------------

export async function listarPropostas(req, res) {
  try {
    const propostas = await listarPropostasPorSolicitacao(req.params.id);
    return res.status(200).json(propostas);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar propostas.', detalhe: error.message });
  }
}

export async function criar(req, res) {
  try {
    const proposta = await criarProposta(req.params.id, req.body || {});
    return res.status(201).json({ message: 'Proposta criada com sucesso.', data: proposta });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function atualizarStatus(req, res) {
  try {
    const proposta = await atualizarStatusProposta(req.params.id, req.body.status, req.body.observacao);
    return res.status(200).json({ message: 'Status da proposta atualizado com sucesso.', data: proposta });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
