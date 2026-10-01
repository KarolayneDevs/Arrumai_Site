import { listarServicos as listarServicosService, criarServico as criarServicoService } from '../services/servicosService.js';

// -----------------------------------------------------------------------------
// CONTROLLER DE SERVIÇOS
// -----------------------------------------------------------------------------
// O controller recebe as requisições HTTP, delega a regra de negócio para o
// service e responde ao cliente em JSON. Isso separa responsabilidades e deixa
// o projeto mais limpo para a equipe entender.
// -----------------------------------------------------------------------------

export async function listarServicos(req, res) {
  try {
    const servicos = await listarServicosService();
    return res.status(200).json(servicos);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar serviços.', detalhe: error.message });
  }
}

export async function criarServico(req, res) {
  try {
    const novoServico = await criarServicoService(req.body || {});
    return res.status(201).json({ message: 'Serviço criado com sucesso.', data: novoServico });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
