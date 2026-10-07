import { memoryStore } from '../config/database.js';
import fs from 'node:fs';
import path from 'node:path';
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

export async function listarSolicitacoes(usuario) {
  if (usuario?.papel === 'admin') return memoryStore.solicitacoes;
  return memoryStore.solicitacoes.filter((solicitacao) => solicitacao.usuarioId === usuario.id);
}

export async function buscarSolicitacaoPorId(id, usuario) {
  const solicitacao = memoryStore.solicitacoes.find((item) => item.id === Number(id));
  if (!solicitacao) return undefined;
  if (usuario && usuario.papel !== 'admin' && solicitacao.usuarioId !== usuario.id) return undefined;
  return solicitacao;
}

export async function criarSolicitacao(dados, usuario) {
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
    usuarioId: usuario.id,
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

export async function atualizarStatusSolicitacao(id, novoStatus, observacao = '', usuario) {
  const solicitacao = await buscarSolicitacaoPorId(id, usuario);

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

export async function adicionarComentario(id, dados, usuario) {
  const solicitacao = await buscarSolicitacaoPorId(id, usuario);

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

export async function listarComentariosPorSolicitacao(id, usuario) {
  await garantirAcesso(id, usuario);
  return memoryStore.comentarios.filter((comentario) => comentario.solicitacaoId === Number(id));
}

export async function listarHistoricoPorSolicitacao(id, usuario) {
  await garantirAcesso(id, usuario);
  return memoryStore.historicoStatus.filter((item) => item.solicitacaoId === Number(id));
}

export async function excluirSolicitacao(id, usuario) {
  const solicitacao = await buscarSolicitacaoPorId(id, usuario);
  if (!solicitacao) throw new Error('Solicitação não encontrada.');

  const solicitacaoId = solicitacao.id;
  const propostaAceita = memoryStore.propostas.some(
    (proposta) => proposta.solicitacaoId === solicitacaoId && proposta.status === 'ACEITA',
  );
  const pagamentoConfirmado = memoryStore.pagamentos.some(
    (pagamento) => pagamento.solicitacaoId === solicitacaoId && pagamento.status === 'CONFIRMADO',
  );

  if (usuario.papel !== 'admin' && propostaAceita && pagamentoConfirmado) {
    throw new Error('Solicitações aceitas e pagas não podem ser apagadas.');
  }

  const arquivos = memoryStore.arquivos.filter((arquivo) => arquivo.solicitacaoId === solicitacaoId);
  for (const arquivo of arquivos) {
    const caminho = String(arquivo.caminho || '').replace(/^[/\\]+/, '');
    const absoluto = path.resolve(process.cwd(), caminho);
    const raizUploads = path.resolve(process.cwd(), 'uploads');
    const relativo = path.relative(raizUploads, absoluto);
    if (relativo && relativo !== '..' && !relativo.startsWith(`..${path.sep}`) && !path.isAbsolute(relativo)) {
      try {
        fs.unlinkSync(absoluto);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  }

  for (const chave of ['historicoStatus', 'comentarios', 'arquivos', 'propostas', 'pagamentos']) {
    memoryStore[chave] = memoryStore[chave].filter((item) => item.solicitacaoId !== solicitacaoId);
  }
  memoryStore.solicitacoes = memoryStore.solicitacoes.filter((item) => item.id !== solicitacaoId);
}

async function garantirAcesso(id, usuario) {
  const solicitacao = await buscarSolicitacaoPorId(id, usuario);
  if (!solicitacao) throw new Error('Solicitação não encontrada.');
  return solicitacao;
}
