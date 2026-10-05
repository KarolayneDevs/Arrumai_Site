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

function prepararEntrega(dados) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let dataEntrega;
  let entregaPrevista = String(dados.entregaPrevista || '').trim();

  if (entregaPrevista) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entregaPrevista);
    if (!partes) throw new Error('Informe uma data de entrega válida.');

    dataEntrega = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
    if (dataEntrega.getFullYear() !== Number(partes[1])
      || dataEntrega.getMonth() !== Number(partes[2]) - 1
      || dataEntrega.getDate() !== Number(partes[3])) {
      throw new Error('Informe uma data de entrega válida.');
    }
    if (dataEntrega < hoje) throw new Error('A data de entrega não pode estar no passado.');
  } else {
    const prazoDias = Number(dados.prazoDias || 0);
    if (!prazoDias || prazoDias <= 0) {
      throw new Error('Informe a data de entrega ou um prazo maior que zero.');
    }
    dataEntrega = new Date(hoje);
    dataEntrega.setDate(dataEntrega.getDate() + prazoDias);
    entregaPrevista = [
      dataEntrega.getFullYear(),
      String(dataEntrega.getMonth() + 1).padStart(2, '0'),
      String(dataEntrega.getDate()).padStart(2, '0'),
    ].join('-');
  }

  const prazoCalculado = Math.max(1, Math.ceil((dataEntrega - hoje) / 86400000));
  return { prazoDias: prazoCalculado, entregaPrevista };
}

export async function criarProposta(solicitacaoId, dados) {
  const solicitacao = await buscarSolicitacaoPorId(solicitacaoId);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  const valor = Number(dados.valor || 0);
  if (!valor || valor <= 0) {
    throw new Error('O valor da proposta deve ser maior que zero.');
  }

  const { prazoDias, entregaPrevista } = prepararEntrega(dados);

  const proposta = {
    id: memoryStore.propostas.length + 1,
    solicitacaoId: solicitacao.id,
    valor,
    prazoDias,
    entregaPrevista,
    observacao: String(dados.observacao || '').trim() || 'Proposta enviada pela equipe.',
    status: 'ENVIADA',
    dataEnvio: new Date().toISOString(),
    dataResposta: null,
  };

  memoryStore.propostas.push(proposta);
  solicitacao.valor = valor;
  solicitacao.entregaPrevista = entregaPrevista;

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
