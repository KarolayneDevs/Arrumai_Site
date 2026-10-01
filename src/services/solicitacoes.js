import { apiFetch } from './api.js';
import { getServicoByBackendId } from './servicos.js';

const STATUS_MAP = {
  RECEBIDA: 'recebida',
  EM_ANALISE: 'em_analise',
  PROPOSTA_ENVIADA: 'proposta_enviada',
  AGUARDANDO_PAGAMENTO: 'aguardando_pagamento',
  PAGAMENTO_CONFIRMADO: 'pagamento_confirmado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDA: 'concluida',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada',
};

const SOLICITACOES_FALLBACK = [
  {
    id: '0231',
    titulo: 'TCC · Enfermagem',
    servico: 'padronizacao',
    norma: 'ABNT NBR 14724',
    status: 'em_andamento',
    valor: 180,
    entregaPrevista: '16/10',
    pagamento: 'Pix',
    datas: {
      recebida: '12/10',
      em_analise: '13/10',
      proposta_enviada: '13/10',
      aguardando_pagamento: '13/10',
      pagamento_confirmado: '14/10',
      em_andamento: '14/10',
      concluida: 'previsto 16/10',
    },
    comentarios: [
      { autor: 'equipe', texto: 'Recebemos seu arquivo. Falta só a folha de aprovação assinada.', quando: '13/10' },
      { autor: 'cliente', texto: 'Enviei agora pouco, obrigada!', quando: '13/10' },
    ],
  },
];

export let SOLICITACOES = [...SOLICITACOES_FALLBACK];

function normalizarStatus(status) {
  return STATUS_MAP[String(status || '').toUpperCase()] || 'recebida';
}

function normalizarSolicitacao(solicitacao) {
  const servicoId = solicitacao.servicoId ?? solicitacao.servico_id ?? solicitacao.servico;
  const servico = getServicoByBackendId(servicoId)?.id || solicitacao.servico || 'criacao';

  return {
    id: String(solicitacao.id),
    protocolo: solicitacao.protocolo || `ARR-${solicitacao.id}`,
    titulo: solicitacao.titulo || 'Solicitação',
    servico,
    norma: solicitacao.norma || 'ABNT',
    status: normalizarStatus(solicitacao.status),
    valor: solicitacao.valor ?? null,
    entregaPrevista: solicitacao.entregaPrevista || null,
    pagamento: solicitacao.metodoPagamento || 'PIX',
    datas: {},
    comentarios: [],
    raw: solicitacao,
  };
}

export async function fetchSolicitacoes() {
  try {
    const dados = await apiFetch('/solicitacoes');
    if (Array.isArray(dados)) {
      SOLICITACOES = dados.map(normalizarSolicitacao);
      return SOLICITACOES;
    }
  } catch (error) {
    console.warn('Falha ao carregar solicitações da API. Usando fallback local.', error.message);
  }

  SOLICITACOES = [...SOLICITACOES_FALLBACK];
  return SOLICITACOES;
}

export async function fetchSolicitacao(id) {
  try {
    const dados = await apiFetch(`/solicitacoes/${id}`);
    return normalizarSolicitacao(dados);
  } catch (error) {
    console.warn('Falha ao carregar solicitação da API.', error.message);
    return SOLICITACOES.find((s) => s.id === String(id));
  }
}

export async function criarSolicitacao(payload) {
  const resposta = await apiFetch('/solicitacoes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const nova = normalizarSolicitacao(resposta.data || resposta);
  SOLICITACOES = [nova, ...SOLICITACOES];
  return nova;
}

export async function uploadArquivoSolicitacao(id, arquivo, tipo = 'DOCUMENTO') {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('tipo', tipo);

  return apiFetch(`/solicitacoes/${id}/arquivos`, {
    method: 'POST',
    body: formData,
  });
}

export async function adicionarComentarioSolicitacao(id, mensagem, autorTipo = 'CLIENTE') {
  const resposta = await apiFetch(`/solicitacoes/${id}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ mensagem, autorTipo }),
  });

  return resposta.data || resposta;
}

export function getSolicitacao(id) {
  return SOLICITACOES.find((s) => s.id === String(id));
}
