import { memoryStore } from '../config/database.js';
import { buscarSolicitacaoPorId, atualizarStatusSolicitacao } from './solicitacoesService.js';

// -----------------------------------------------------------------------------
// SERVIÇO DE PROPOSTAS
// -----------------------------------------------------------------------------
// Aqui ficam as regras de proposta da solicitação: criação, listagem, aceitação e
// recusa. Esse módulo mantém o fluxo da equipe e do cliente alinhado ao status
// da solicitação.
// -----------------------------------------------------------------------------

export async function listarPropostasPorSolicitacao(id) {
  const solicitacaoId = Number(id);
  return memoryStore.propostas.filter((proposta) => proposta.solicitacaoId === solicitacaoId);
}

export async function criarProposta(solicitacaoId, dados) {
  const solicitacao = await buscarSolicitacaoPorId(solicitacaoId);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  const valor = Number(dados.valor || 0);
  const prazoDias = Number(dados.prazoDias || 0);

  if (!valor || valor <= 0) {
    throw new Error('O valor da proposta deve ser maior que zero.');
  }

  if (!prazoDias || prazoDias <= 0) {
    throw new Error('O prazo em dias da proposta deve ser maior que zero.');
  }

  const proposta = {
    id: memoryStore.propostas.length + 1,
    solicitacaoId: solicitacao.id,
    valor,
    prazoDias,
    observacao: String(dados.observacao || '').trim() || 'Proposta enviada pela equipe.',
    status: 'ENVIADA',
    dataEnvio: new Date().toISOString(),
    dataResposta: null,
  };

  memoryStore.propostas.push(proposta);

  if (solicitacao.status === 'RECEBIDA') {
    await atualizarStatusSolicitacao(solicitacao.id, 'EM_ANALISE', 'Solicitação em análise pela equipe.');
  }

  if (solicitacao.status !== 'PROPOSTA_ENVIADA') {
    await atualizarStatusSolicitacao(
      solicitacao.id,
      'PROPOSTA_ENVIADA',
      'Proposta enviada para o cliente. '
    );
  }

  return proposta;
}

export async function atualizarStatusProposta(id, novoStatus, observacao = '') {
  const proposta = memoryStore.propostas.find((item) => item.id === Number(id));

  if (!proposta) {
    throw new Error('Proposta não encontrada.');
  }

  const statusValido = ['PENDENTE', 'ENVIADA', 'ACEITA', 'RECUSADA'];

  if (!statusValido.includes(novoStatus)) {
    throw new Error('Status de proposta inválido.');
  }

  proposta.status = novoStatus;
  proposta.dataResposta = new Date().toISOString();
  proposta.observacao = observacao || proposta.observacao;

  if (novoStatus === 'ACEITA') {
    await atualizarStatusSolicitacao(
      proposta.solicitacaoId,
      'AGUARDANDO_PAGAMENTO',
      'Cliente aceitou a proposta. Aguardando pagamento.'
    );
  }

  if (novoStatus === 'RECUSADA') {
    await atualizarStatusSolicitacao(
      proposta.solicitacaoId,
      'RECUSADA',
      'Cliente recusou a proposta.'
    );
  }

  return proposta;
}
