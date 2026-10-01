import { memoryStore } from '../config/database.js';

// -----------------------------------------------------------------------------
// SERVIÇOS
// -----------------------------------------------------------------------------
// Este serviço centraliza a lógica de leitura e criação dos serviços vendidos
// pela plataforma. Ele serve como ponte entre a rota e a base de dados.
// -----------------------------------------------------------------------------

export async function listarServicos() {
  return memoryStore.servicos.filter((servico) => servico.ativo);
}

export async function criarServico(dados) {
  const nome = String(dados.nome || '').trim();
  const descricao = String(dados.descricao || '').trim();

  if (!nome) {
    throw new Error('O nome do serviço é obrigatório.');
  }

  const novoServico = {
    id: memoryStore.servicos.length + 1,
    nome,
    slug: (dados.slug || nome.toLowerCase().replace(/\s+/g, '-')),
    icon: dados.icon || 'documento',
    descricao,
    ativo: dados.ativo !== false,
    ordem: Number(dados.ordem || memoryStore.servicos.length + 1),
  };

  memoryStore.servicos.push(novoServico);
  return novoServico;
}
