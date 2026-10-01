import { memoryStore } from '../config/database.js';
import { buscarSolicitacaoPorId } from './solicitacoesService.js';

// -----------------------------------------------------------------------------
// SERVIÇO DE ARQUIVOS
// -----------------------------------------------------------------------------
// Os arquivos da solicitação são armazenados em metadados para manter o fluxo
// do sistema funcional sem exigir upload real no estágio atual. Isso permite a
// equipe evoluir para armazenagem em disco ou nuvem depois.
// -----------------------------------------------------------------------------

export async function listarArquivosPorSolicitacao(id) {
  const solicitacaoId = Number(id);
  return memoryStore.arquivos.filter((arquivo) => arquivo.solicitacaoId === solicitacaoId);
}

export async function criarArquivo(solicitacaoId, dados) {
  const solicitacao = await buscarSolicitacaoPorId(solicitacaoId);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  const tipo = String(dados.tipo || '').trim();
  const nomeOriginal = String(dados.nomeOriginal || '').trim();
  const nomeArmazenado = String(dados.nomeArmazenado || '').trim();
  const caminho = String(dados.caminho || '').trim();

  if (!tipo) {
    throw new Error('O tipo do arquivo é obrigatório.');
  }

  if (!nomeOriginal || !nomeArmazenado || !caminho) {
    throw new Error('Dados do arquivo incompletos.');
  }

  const arquivo = {
    id: memoryStore.arquivos.length + 1,
    solicitacaoId: solicitacao.id,
    tipo,
    nomeOriginal,
    nomeArmazenado,
    caminho,
    mimeType: dados.mimeType || 'application/octet-stream',
    tamanhoBytes: Number(dados.tamanhoBytes || 0),
    dataHora: new Date().toISOString(),
  };

  memoryStore.arquivos.push(arquivo);
  return arquivo;
}
