import { apiFetch } from './api.js';
import { getServicoByBackendId } from './servicos.js';

/* =====================================================================
   SERVIÇO DA ÁREA ADMINISTRATIVA
   Todas as chamadas à API que o painel da equipe usa ficam aqui.
   A tela só chama estas funções e não precisa saber os endereços.

   DIFERENÇA para services/solicitacoes.js: aqui NÃO usamos dados de
   exemplo quando a API falha. Para quem administra, mostrar dados falsos
   seria perigoso (parece que está tudo certo, mas nada é salvo). Se a
   API estiver fora do ar, a tela avisa e pede para tentar de novo.
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

/** Lista TODAS as solicitações, da mais nova para a mais antiga. */
export async function listarSolicitacoesAdmin() {
  const dados = await apiFetch('/solicitacoes');
  if (!Array.isArray(dados)) throw new Error('A API respondeu em um formato inesperado.');

  return dados
    .map(normalizar)
    .sort((a, b) => new Date(b.criadaEm || 0) - new Date(a.criadaEm || 0) || Number(b.id) - Number(a.id));
}

/** Busca uma solicitação pelo id. */
export async function buscarSolicitacaoAdmin(id) {
  return normalizar(await apiFetch(`/solicitacoes/${id}`));
}

// ----- Listas ligadas a uma solicitação (cada uma devolve um array) -----
export const listarArquivos = (id) => apiFetch(`/solicitacoes/${id}/arquivos`);
export const listarPropostas = (id) => apiFetch(`/solicitacoes/${id}/propostas`);
export const listarPagamentos = (id) => apiFetch(`/solicitacoes/${id}/pagamentos`);
export const listarHistorico = (id) => apiFetch(`/solicitacoes/${id}/historico`);

// ----- Ações da equipe -----

/**
 * Muda o status da solicitação.
 * O backend só aceita avançar UMA etapa por vez (ou encerrar com RECUSADA/CANCELADA).
 * "observacao" fica registrada no histórico (ex.: o motivo da recusa).
 */
export async function atualizarStatus(id, status, observacao = '') {
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
export async function enviarProposta(id, { valor, prazoDias, observacao }) {
  return apiFetch(`/solicitacoes/${id}/propostas`, {
    method: 'POST',
    body: JSON.stringify({ valor, prazoDias, observacao }),
  });
}

/** Confere o comprovante: status "CONFIRMADO" ou "REJEITADO". */
export async function atualizarStatusPagamento(pagamentoId, status, observacao = '') {
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