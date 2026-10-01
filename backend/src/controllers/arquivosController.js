import { listarArquivosPorSolicitacao, criarArquivo } from '../services/arquivosService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE ARQUIVOS
// -----------------------------------------------------------------------------
// Essa camada expõe os endpoints para listagem e envio de arquivos relacionados a
// uma solicitação. O upload real passa por req.file; o fluxo antigo em JSON continua
// funcionando porque a camada de serviço aceita ambos os formatos.
// -----------------------------------------------------------------------------

export async function listarArquivos(req, res) {
  try {
    const arquivos = await listarArquivosPorSolicitacao(req.params.id);
    return res.status(200).json(arquivos);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar arquivos.', detalhe: error.message });
  }
}

export async function criar(req, res) {
  try {
    const dadosArquivo = {
      ...(req.body || {}),
      file: req.file || null,
    };

    const arquivo = await criarArquivo(req.params.id, dadosArquivo);
    return res.status(201).json({ message: 'Arquivo registrado com sucesso.', data: arquivo });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
