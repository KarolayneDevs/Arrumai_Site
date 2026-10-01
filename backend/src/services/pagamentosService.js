import { memoryStore } from '../config/database.js';
import { buscarSolicitacaoPorId, atualizarStatusSolicitacao } from './solicitacoesService.js';

// -----------------------------------------------------------------------------
// SERVIÇO DE PAGAMENTOS
// -----------------------------------------------------------------------------
// Este módulo centraliza o fluxo de pagamento: registro do Pix, validação do
// comprovante e atualização do status da solicitação.
// -----------------------------------------------------------------------------

export async function listarPagamentosPorSolicitacao(id) {
  const solicitacaoId = Number(id);
  return memoryStore.pagamentos.filter((pagamento) => pagamento.solicitacaoId === solicitacaoId);
}

export async function criarPagamento(solicitacaoId, dados) {
  const solicitacao = await buscarSolicitacaoPorId(solicitacaoId);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  const valor = Number(dados.valor || 0);
  const chavePix = String(dados.chavePix || '').trim();

  if (!chavePix) {
    throw new Error('A chave Pix para pagamento é obrigatória.');
  }

  if (!valor || valor <= 0) {
    throw new Error('O valor do pagamento deve ser maior que zero.');
  }

  const pagamento = {
    id: memoryStore.pagamentos.length + 1,
    solicitacaoId: solicitacao.id,
    chavePix,
    valor,
    metodo: String(dados.metodo || 'PIX').toUpperCase(),
    status: 'PENDENTE',
    comprovanteId: dados.comprovanteId || null,
    dataComprovante: dados.dataComprovante || new Date().toISOString(),
    dataConferencia: null,
    motivoRecusa: null,
  };

  memoryStore.pagamentos.push(pagamento);
  return pagamento;
}

export async function atualizarStatusPagamento(id, novoStatus, observacao = '') {
  const pagamento = memoryStore.pagamentos.find((item) => item.id === Number(id));

  if (!pagamento) {
    throw new Error('Pagamento não encontrado.');
  }

  const statusValido = ['PENDENTE', 'AGUARDANDO_COMPROVANTE', 'CONFIRMADO', 'REJEITADO'];

  if (!statusValido.includes(novoStatus)) {
    throw new Error('Status de pagamento inválido.');
  }

  pagamento.status = novoStatus;
  pagamento.dataConferencia = new Date().toISOString();

  if (novoStatus === 'REJEITADO') {
    pagamento.motivoRecusa = observacao || 'Pagamento rejeitado.';
  } else {
    pagamento.motivoRecusa = null;
  }

  if (novoStatus === 'CONFIRMADO') {
    await atualizarStatusSolicitacao(
      pagamento.solicitacaoId,
      'PAGAMENTO_CONFIRMADO',
      'Pagamento confirmado com sucesso.'
    );
  }

  return pagamento;
}
