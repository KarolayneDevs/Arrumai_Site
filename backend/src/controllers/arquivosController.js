import { listarArquivosPorSolicitacao, criarArquivo } from '../services/arquivosService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE ARQUIVOS
// -----------------------------------------------------------------------------
// Essa camada expõe os endpoints para listagem e envio de arquivos relacionados a
// uma solicitação.
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
    const arquivo = await criarArquivo(req.params.id, req.body || {});
    return res.status(201).json({ message: 'Arquivo registrado com sucesso.', data: arquivo });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
