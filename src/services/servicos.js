import { apiFetch } from './api.js';

/* =====================================================================
   SERVIÇOS OFERECIDOS
   A lista vem da API do backend e usa um fallback local em caso de falha.
   ===================================================================== */
const SERVICOS_FALLBACK = [
  {
    id: 'criacao',
    nome: 'Criação',
    icone: 'documento',
    descricao: 'Você tem o conteúdo e precisa do documento montado do zero, com capa, sumário e referências.',
    backendId: 1,
  },
  {
    id: 'revisao',
    nome: 'Revisão',
    icone: 'aprovacao',
    descricao: 'Seu texto já existe. Conferimos erros de norma, citações e referências antes de você entregar.',
    backendId: 2,
  },
  {
    id: 'padronizacao',
    nome: 'Padronização',
    icone: 'versoes',
    descricao: 'Ajustamos margens, fontes, títulos e citações para a ABNT ou para a norma da sua instituição.',
    backendId: 3,
  },
];

export let SERVICOS = [...SERVICOS_FALLBACK];

function normalizarServico(servico) {
  const id = servico.slug || String(servico.id || '');
  return {
    id,
    nome: servico.nome,
    icone: servico.icon || servico.icone || 'documento',
    descricao: servico.descricao || '',
    backendId: Number(servico.id),
    slug: servico.slug || id,
  };
}

export async function fetchServicos() {
  try {
    const dados = await apiFetch('/servicos');
    if (Array.isArray(dados) && dados.length > 0) {
      SERVICOS = dados.map(normalizarServico);
      return SERVICOS;
    }
  } catch (error) {
    console.warn('Falha ao carregar serviços da API. Usando fallback local.', error.message);
  }

  SERVICOS = [...SERVICOS_FALLBACK];
  return SERVICOS;
}

export function getServico(id) {
  return SERVICOS.find((s) => s.id === id || s.slug === id || s.backendId === Number(id));
}

export function getServicoBackendId(servicoId) {
  const servico = getServico(servicoId);
  const valor = servico?.backendId ?? Number(servicoId);
  return Number.isFinite(valor) ? valor : null;
}

export function getServicoByBackendId(id) {
  return SERVICOS.find((s) => s.backendId === Number(id));
}
