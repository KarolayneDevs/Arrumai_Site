import {
  listarPagamentosPorSolicitacao,
  criarPagamento,
  atualizarStatusPagamento,
} from '../services/pagamentosService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE PAGAMENTOS
// -----------------------------------------------------------------------------
// O fluxo de pagamento fica isolado aqui para manter a API organizada e simples.
// -----------------------------------------------------------------------------

export async function listarPagamentos(req, res) {
  try {
    const pagamentos = await listarPagamentosPorSolicitacao(req.params.id);
    return res.status(200).json(pagamentos);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar pagamentos.', detalhe: error.message });
  }
}

export async function criar(req, res) {
  try {
    const pagamento = await criarPagamento(req.params.id, req.body || {});
    return res.status(201).json({ message: 'Pagamento registrado com sucesso.', data: pagamento });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function atualizarStatus(req, res) {
  try {
    const pagamento = await atualizarStatusPagamento(req.params.id, req.body.status, req.body.observacao);
    return res.status(200).json({ message: 'Status do pagamento atualizado com sucesso.', data: pagamento });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
