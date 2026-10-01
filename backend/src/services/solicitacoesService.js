import { memoryStore } from '../config/database.js';
import { podeAvancarStatus, STATUS_FINAIS, statusEhValido } from '../utils/status.js';

// -----------------------------------------------------------------------------
// SOLICITAÇÕES
// -----------------------------------------------------------------------------
// Aqui fica a regra do principal fluxo do projeto: criação da solicitação,
// atualização do status, comentários e histórico. Isso é o coração do sistema.
// -----------------------------------------------------------------------------

function gerarProtocolo() {
  const numero = String(Date.now()).slice(-6);
  return `ARR-${numero}`;
}

export async function listarSolicitacoes() {
  return memoryStore.solicitacoes;
}

export async function buscarSolicitacaoPorId(id) {
  return memoryStore.solicitacoes.find((solicitacao) => solicitacao.id === Number(id));
}

export async function criarSolicitacao(dados) {
  const servicoId = Number(dados.servicoId || 0);
  const titulo = String(dados.titulo || '').trim();
  const descricao = String(dados.descricao || '').trim();

  if (!servicoId) {
    throw new Error('É necessário escolher um serviço válido.');
  }

  if (!titulo) {
    throw new Error('O título da solicitação é obrigatório.');
  }

  if (!descricao) {
    throw new Error('A descrição da necessidade é obrigatória.');
  }

  const novaSolicitacao = {
    id: memoryStore.solicitacoes.length + 1,
    protocolo: gerarProtocolo(),
    usuarioId: dados.usuarioId || null,
    servicoId,
    titulo,
    norma: dados.norma || 'Norma não informada',
    descricao,
    status: 'RECEBIDA',
    valor: null,
    entregaPrevista: null,
    metodoPagamento: 'PIX',
    createdAt: new Date().toISOString(),
  };

  memoryStore.solicitacoes.push(novaSolicitacao);

  memoryStore.historicoStatus.push({
    id: memoryStore.historicoStatus.length + 1,
    solicitacaoId: novaSolicitacao.id,
    statusAnterior: null,
    statusNovo: 'RECEBIDA',
    observacao: 'Solicitação criada pelo cliente.',
    dataHora: new Date().toISOString(),
  });

  return novaSolicitacao;
}

export async function atualizarStatusSolicitacao(id, novoStatus, observacao = '') {
  const solicitacao = await buscarSolicitacaoPorId(id);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  if (!statusEhValido(novoStatus)) {
    throw new Error('Status inválido.');
  }

  if (STATUS_FINAIS.includes(solicitacao.status) && !STATUS_FINAIS.includes(novoStatus)) {
    throw new Error('Uma solicitação encerrada não pode voltar para a sequência principal.');
  }

  if (!podeAvancarStatus(solicitacao.status, novoStatus)) {
    throw new Error(`Transição inválida: ${solicitacao.status} -> ${novoStatus}`);
  }

  const statusAnterior = solicitacao.status;
  solicitacao.status = novoStatus;

  memoryStore.historicoStatus.push({
    id: memoryStore.historicoStatus.length + 1,
    solicitacaoId: solicitacao.id,
    statusAnterior,
    statusNovo: novoStatus,
    observacao: observacao || 'Status atualizado pelo sistema.',
    dataHora: new Date().toISOString(),
  });

  return solicitacao;
}

export async function adicionarComentario(id, dados) {
  const solicitacao = await buscarSolicitacaoPorId(id);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  const mensagem = String(dados.mensagem || '').trim();

  if (!mensagem) {
    throw new Error('A mensagem do comentário não pode ficar vazia.');
  }

  const comentario = {
    id: memoryStore.comentarios.length + 1,
    solicitacaoId: solicitacao.id,
    usuarioId: dados.usuarioId || null,
    autorTipo: dados.autorTipo || 'CLIENTE',
    mensagem,
    dataHora: new Date().toISOString(),
  };

  memoryStore.comentarios.push(comentario);
  return comentario;
}

export async function listarComentariosPorSolicitacao(id) {
  return memoryStore.comentarios.filter((comentario) => comentario.solicitacaoId === Number(id));
}

export async function listarHistoricoPorSolicitacao(id) {
  return memoryStore.historicoStatus.filter((item) => item.solicitacaoId === Number(id));
}
