import { apiFetch, apiUrl } from './api.js';
import { getServicoByBackendId } from './servicos.js';

const SOLICITACOES_DEMO = [
  {
    id: 'demo-1001',
    protocolo: 'ARR-DEMO-1001',
    titulo: 'TCC · Enfermagem',
    servicoId: 3,
    norma: 'ABNT NBR 14724',
    descricao: 'Preciso padronizar o trabalho e revisar as referências antes da entrega.',
    status: 'RECEBIDA',
    valor: null,
    createdAt: '2026-10-01T12:00:00.000Z',
  },
];

let demonstracaoAtiva = false;

export function usandoDemonstracao() {
  return demonstracaoAtiva;
}

/* =====================================================================
   SERVIÇO DA ÁREA ADMINISTRATIVA
   Todas as chamadas à API que o painel da equipe usa ficam aqui.
   A tela só chama estas funções e não precisa saber os endereços.

  No modo normal, a API é a fonte dos dados. Se ela estiver indisponível,
  este módulo usa registros de demonstração apenas para permitir visualizar
  as telas; o painel exibe um aviso e essas alterações não são persistidas.
   ===================================================================== */

/**
 * A API devolve campos como "servicoId" e status em MAIÚSCULAS ("EM_ANALISE").
 * Esta função arruma tudo no formato que as telas usam.
 */
function normalizar(s) {
  const servico = getServicoByBackendId(s.servicoId ?? s.servico_id);
  return {
    id: String(s.id),
    protocolo: s.protocolo || `ARR-${s.id}`,
    titulo: s.titulo || 'Solicitação',
    servicoNome: servico?.nome || 'Serviço',
    norma: s.norma || 'Não informada',
    descricao: s.descricao || '',
    // "EM_ANALISE" -> "em_analise" (mesmas chaves de utils/status.js)
    status: String(s.status || 'RECEBIDA').toLowerCase(),
    valor: s.valor ?? null,
    entregaPrevista: s.entregaPrevista ?? null,
    criadaEm: s.createdAt || null,
  };
}
const PROPOSTAS_DEMO = [];
const PAGAMENTOS_DEMO = [];

function encontrarSolicitacaoDemo(id) {
  return SOLICITACOES_DEMO.find((item) => String(item.id) === String(id));
}

function criarPropostaDemo(id, dados) {
  const solicitacao = encontrarSolicitacaoDemo(id);
  if (!solicitacao) throw new Error('Solicitação de demonstração não encontrada.');

  const entregaPrevista = String(dados.entregaPrevista || '').trim();
  const partesData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entregaPrevista);
  if (!partesData) throw new Error('Informe uma data de entrega válida.');

  const dataEntrega = new Date(Number(partesData[1]), Number(partesData[2]) - 1, Number(partesData[3]));
  if (dataEntrega.getFullYear() !== Number(partesData[1])
    || dataEntrega.getMonth() !== Number(partesData[2]) - 1
    || dataEntrega.getDate() !== Number(partesData[3])
    || dataEntrega < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new Error('Informe uma data de entrega válida e futura.');
  }

  const proposta = {
    id: `demo-proposta-${PROPOSTAS_DEMO.length + 1}`,
    solicitacaoId: solicitacao.id,
    valor: Number(dados.valor),
    prazoDias: Math.max(1, Math.ceil((dataEntrega - new Date()) / 86400000)),
    entregaPrevista,
    observacao: dados.observacao || '',
    status: 'ENVIADA',
  };

  PROPOSTAS_DEMO.push(proposta);
  solicitacao.valor = proposta.valor;
  solicitacao.status = 'PROPOSTA_ENVIADA';
  solicitacao.entregaPrevista = entregaPrevista;
  return { data: proposta };
}

/** Lista TODAS as solicitações, da mais nova para a mais antiga. */
export async function listarSolicitacoesAdmin() {
  try {
    const dados = await apiFetch('/solicitacoes');
    if (!Array.isArray(dados)) throw new Error('A API respondeu em um formato inesperado.');

    return dados
      .map(normalizar)
      .sort((a, b) => new Date(b.criadaEm || 0) - new Date(a.criadaEm || 0) || Number(b.id) - Number(a.id));
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    demonstracaoAtiva = true;
    return SOLICITACOES_DEMO.map(normalizar);
  }

}

export async function excluirSolicitacaoAdmin(id) {
  if (demonstracaoAtiva) {
    const indice = SOLICITACOES_DEMO.findIndex((item) => String(item.id) === String(id));
    if (indice >= 0) SOLICITACOES_DEMO.splice(indice, 1);
    return;
  }
  await apiFetch(`/solicitacoes/${id}`, { method: 'DELETE' });
}

/** Busca uma solicitação pelo id. */
export async function buscarSolicitacaoAdmin(id) {
  try {
    return normalizar(await apiFetch(`/solicitacoes/${id}`));
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    demonstracaoAtiva = true;
    const solicitacao = encontrarSolicitacaoDemo(id);
    if (!solicitacao) throw new Error('Solicitação de demonstração não encontrada.');
    return normalizar(solicitacao);
  }
}

// ----- Listas ligadas a uma solicitação (cada uma devolve um array) -----
async function listarComFallback(id, rota, dadosDemo) {
  if (demonstracaoAtiva) return dadosDemo;
  try {
    return await apiFetch(rota);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    demonstracaoAtiva = true;
    return dadosDemo;
  }
}

export const listarArquivos = (id) => listarComFallback(id, `/solicitacoes/${id}/arquivos`, []);
export const listarPropostas = (id) => listarComFallback(
  id,
  `/solicitacoes/${id}/propostas`,
  PROPOSTAS_DEMO.filter((item) => String(item.solicitacaoId) === String(id)),
);
export const listarPagamentos = (id) => listarComFallback(
  id,
  `/solicitacoes/${id}/pagamentos`,
  PAGAMENTOS_DEMO.filter((item) => String(item.solicitacaoId) === String(id)),
);
export const listarHistorico = (id) => listarComFallback(id, `/solicitacoes/${id}/historico`, []);

// Constrói o endereço que abre o arquivo pelo endpoint de visualização da API.
export const urlArquivo = (id) => apiUrl(`/arquivos/${id}/visualizar`);

/** Busca e normaliza as mensagens para o histórico exibido à equipe. */
export async function listarComentariosAdmin(id) {
  const comentarios = await apiFetch(`/solicitacoes/${id}/comentarios`);
  if (!Array.isArray(comentarios)) throw new Error('A API respondeu em um formato inesperado para os comentários.');

  return comentarios.map((comentario) => ({
    id: String(comentario.id),
    autor: String(comentario.autorTipo || '').toUpperCase() === 'EQUIPE' ? 'equipe' : 'cliente',
    texto: comentario.mensagem || '',
    quando: comentario.dataHora || comentario.createdAt || null,
  }));
}

/** Envia a resposta com autoria de equipe para ela aparecer também ao cliente. */
export async function responderComentarioAdmin(id, mensagem) {
  const resposta = await apiFetch(`/solicitacoes/${id}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ mensagem, autorTipo: 'EQUIPE' }),
  });

  return resposta.data || resposta;
}

/** Envia a entrega final como metadado DOCUMENTO_FINAL da solicitação. */
export async function enviarDocumentoFinal(id, arquivo) {
  const formData = new FormData();
  formData.append('tipo', 'DOCUMENTO_FINAL');
  formData.append('arquivo', arquivo);

  return apiFetch(`/solicitacoes/${id}/arquivos`, {
    method: 'POST',
    body: formData,
  });
}

// ----- Ações da equipe -----

/**
 * Muda o status da solicitação.
 * O backend só aceita avançar UMA etapa por vez (ou encerrar com RECUSADA/CANCELADA).
 * "observacao" fica registrada no histórico (ex.: o motivo da recusa).
 */
export async function atualizarStatus(id, status, observacao = '') {
  if (demonstracaoAtiva) {
    const solicitacao = encontrarSolicitacaoDemo(id);
    if (!solicitacao) throw new Error('Solicitação de demonstração não encontrada.');
    solicitacao.status = status.toUpperCase();
    return { data: solicitacao };
  }

  return apiFetch(`/solicitacoes/${id}/status`, {
    method: 'PATCH',
    // A API espera o status em MAIÚSCULAS
    body: JSON.stringify({ status: status.toUpperCase(), observacao }),
  });
}

/**
 * ACEITAR a solicitação = enviar a proposta com valor e prazo.
 * O backend sozinho leva a solicitação até "Proposta enviada".
 */
export async function enviarProposta(id, { valor, prazoDias, entregaPrevista, observacao }) {
  const dados = { valor, prazoDias, entregaPrevista, observacao };
  if (demonstracaoAtiva) return criarPropostaDemo(id, dados);

  return apiFetch(`/solicitacoes/${id}/propostas`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

/** Confere o comprovante: status "CONFIRMADO" ou "REJEITADO". */
export async function atualizarStatusPagamento(pagamentoId, status, observacao = '') {
  if (demonstracaoAtiva) {
    const pagamento = PAGAMENTOS_DEMO.find((item) => String(item.id) === String(pagamentoId));
    if (!pagamento) throw new Error('Pagamento de demonstração não encontrado.');
    pagamento.status = status;
    if (status === 'CONFIRMADO') {
      const solicitacao = encontrarSolicitacaoDemo(pagamento.solicitacaoId);
      if (solicitacao) solicitacao.status = 'PAGAMENTO_CONFIRMADO';
    }
    return { data: pagamento };
  }

  return apiFetch(`/pagamentos/${pagamentoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, observacao }),
  });
}

/**
 * Transforma qualquer erro em uma frase clara para a tela.
 * Quando o backend está desligado, o navegador lança um TypeError sem
 * explicação nenhuma ("Failed to fetch"). Aqui traduzimos isso.
 */
export function mensagemDeErro(erro) {
  if (erro instanceof TypeError) {
    return 'Não consegui falar com a API. Confira se o backend está rodando (na pasta backend: npm run dev).';
  }
  return erro?.message || 'Algo deu errado. Tente de novo.';
}