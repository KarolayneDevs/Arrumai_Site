import fs from 'fs';
import path from 'path';
import { memoryStore } from '../config/database.js';
import { buscarSolicitacaoPorId } from './solicitacoesService.js';

const uploadRoot = path.resolve(process.cwd(), 'uploads');

// -----------------------------------------------------------------------------
// SERVIÇO DE ARQUIVOS
// -----------------------------------------------------------------------------
// Os arquivos da solicitação são armazenados em disco para não sobrecarregar o
// banco com conteúdo binário. No MySQL ficam apenas os metadados e o caminho do
// arquivo salvo localmente.
// -----------------------------------------------------------------------------

export async function listarArquivosPorSolicitacao(id) {
  const solicitacaoId = Number(id);
  return memoryStore.arquivos.filter((arquivo) => arquivo.solicitacaoId === solicitacaoId);
}

export async function buscarArquivoPorId(id) {
  return memoryStore.arquivos.find((arquivo) => String(arquivo.id) === String(id));
}

export function resolverCaminhoArquivo(arquivo) {
  const caminhoRelativo = String(arquivo.caminho || '').replace(/^[/\\]+/, '');
  const caminhoAbsoluto = path.resolve(process.cwd(), caminhoRelativo);
  const caminhoDentroDaPasta = path.relative(uploadRoot, caminhoAbsoluto);

  if (!caminhoDentroDaPasta || caminhoDentroDaPasta === '..'
    || caminhoDentroDaPasta.startsWith(`..${path.sep}`) || path.isAbsolute(caminhoDentroDaPasta)) {
    throw new Error('Caminho do arquivo inválido.');
  }

  return caminhoAbsoluto;
}

export async function criarArquivo(solicitacaoId, dados = {}) {
  const solicitacao = await buscarSolicitacaoPorId(solicitacaoId);

  if (!solicitacao) {
    throw new Error('Solicitação não encontrada.');
  }

  let tipo = String(dados.tipo || '').trim().toUpperCase();
  let nomeOriginal = String(dados.nomeOriginal || '').trim();
  let caminho = String(dados.caminho || '').trim();
  let mimeType = String(dados.mimeType || dados.file?.mimetype || 'application/octet-stream').trim();
  let tamanhoBytes = Number(dados.tamanhoBytes || 0);

  const arquivoUpload = dados.file || null;

  if (arquivoUpload) {
    const nomeArquivo = arquivoUpload.filename || arquivoUpload.originalname;
    const destino = arquivoUpload.destination || path.resolve(process.cwd(), 'uploads', 'solicitacoes');

    nomeOriginal = nomeOriginal || arquivoUpload.originalname || 'arquivo-upload';
    tipo = tipo || 'DOCUMENTO';
    mimeType = mimeType || arquivoUpload.mimetype || 'application/octet-stream';
    tamanhoBytes = tamanhoBytes || Number(arquivoUpload.size || 0);

    const caminhoRelativo = path.relative(process.cwd(), path.join(destino, nomeArquivo)).replace(/\\/g, '/');
    caminho = caminho || `/${caminhoRelativo}`;

    if (!fs.existsSync(destino)) {
      fs.mkdirSync(destino, { recursive: true });
    }
  }

  if (!tipo) {
    throw new Error('O tipo do arquivo é obrigatório.');
  }

  if (!nomeOriginal) {
    throw new Error('Nome original do arquivo ausente.');
  }

  if (!caminho) {
    throw new Error('Caminho do arquivo inválido.');
  }

  const nomeArmazenado = path.basename(caminho) || `arquivo-${Date.now()}`;

  const arquivo = {
    id: memoryStore.arquivos.length + 1,
    solicitacaoId: solicitacao.id,
    tipo,
    nomeOriginal,
    nomeArmazenado,
    caminho,
    mimeType,
    tamanhoBytes,
    dataHora: new Date().toISOString(),
  };

  memoryStore.arquivos.push(arquivo);
  return arquivo;
}
