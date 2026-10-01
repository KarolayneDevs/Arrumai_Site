import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DO BANCO
// -----------------------------------------------------------------------------
// A ideia é simples: se o ambiente tiver MySQL configurado, usamos o banco real.
// Caso contrário, caímos em um armazenamento em memória para que a API consiga
// rodar e testar a base funcional do fluxo principal sem bloquear o time.
// -----------------------------------------------------------------------------

dotenv.config();

export const memoryStore = {
  servicos: [
    {
      id: 1,
      nome: 'Criação',
      slug: 'criacao',
      icon: 'documento',
      descricao: 'Documentação montada do zero com capa, sumário e referências.',
      ativo: true,
      ordem: 1,
    },
    {
      id: 2,
      nome: 'Revisão',
      slug: 'revisao',
      icon: 'aprovacao',
      descricao: 'Correção de norma, referências e estrutura do texto existente.',
      ativo: true,
      ordem: 2,
    },
    {
      id: 3,
      nome: 'Padronização',
      slug: 'padronizacao',
      icon: 'versoes',
      descricao: 'Ajustes visuais e estruturais para seguir o padrão exigido.',
      ativo: true,
      ordem: 3,
    },
  ],
  solicitacoes: [
    {
      id: 1,
      protocolo: 'ARR-2024-001',
      usuarioId: null,
      servicoId: 3,
      titulo: 'TCC · Enfermagem',
      norma: 'ABNT NBR 14724',
      descricao: 'Preciso de padronização de monografia para a banca.',
      status: 'EM_ANDAMENTO',
      valor: 180,
      entregaPrevista: '2024-10-16',
      metodoPagamento: 'PIX',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      protocolo: 'ARR-2024-002',
      usuarioId: null,
      servicoId: 2,
      titulo: 'Artigo para periódico',
      norma: 'ABNT NBR 6022',
      descricao: 'Preciso revisar artigo científico e corrigir referências.',
      status: 'PROPOSTA_ENVIADA',
      valor: 120,
      entregaPrevista: '2024-10-22',
      metodoPagamento: 'PIX',
      createdAt: new Date().toISOString(),
    },
  ],
  historicoStatus: [
    {
      id: 1,
      solicitacaoId: 1,
      statusAnterior: null,
      statusNovo: 'RECEBIDA',
      observacao: 'Solicitação criada.',
      dataHora: new Date().toISOString(),
    },
    {
      id: 2,
      solicitacaoId: 1,
      statusAnterior: 'RECEBIDA',
      statusNovo: 'EM_ANDAMENTO',
      observacao: 'Trabalho já em execução.',
      dataHora: new Date().toISOString(),
    },
  ],
  comentarios: [
    {
      id: 1,
      solicitacaoId: 1,
      usuarioId: null,
      autorTipo: 'EQUIPE',
      mensagem: 'Recebemos seu arquivo. Falta só a folha de aprovação assinada.',
      dataHora: new Date().toISOString(),
    },
  ],
  arquivos: [
    {
      id: 1,
      solicitacaoId: 1,
      tipo: 'DOCUMENTO',
      nomeOriginal: 'modelo-tcc.pdf',
      nomeArmazenado: 'documento-1.pdf',
      caminho: '/uploads/documento-1.pdf',
      mimeType: 'application/pdf',
      tamanhoBytes: 245760,
      dataHora: new Date().toISOString(),
    },
  ],
  propostas: [
    {
      id: 1,
      solicitacaoId: 1,
      valor: 180,
      prazoDias: 10,
      observacao: 'Proposta inicial com revisão final.',
      status: 'ACEITA',
      dataEnvio: new Date().toISOString(),
      dataResposta: new Date().toISOString(),
    },
  ],
  pagamentos: [
    {
      id: 1,
      solicitacaoId: 1,
      chavePix: 'pagamentos@arrumai.com.br',
      valor: 180,
      metodo: 'PIX',
      status: 'CONFIRMADO',
      comprovanteId: 1,
      dataComprovante: new Date().toISOString(),
      dataConferencia: new Date().toISOString(),
      motivoRecusa: null,
    },
  ],
};

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arrumai',
};

let pool = null;

export async function getDatabasePool() {
  if (pool) {
    return pool;
  }

  const hasMysqlConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME);

  if (!hasMysqlConfig) {
    return null;
  }

  pool = mysql.createPool(dbConfig);
  return pool;
}

export async function testConnection() {
  const connection = await getDatabasePool();

  if (!connection) {
    return { ok: false, message: 'MySQL não configurado; usando armazenamento em memória.' };
  }

  try {
    await connection.query('SELECT 1');
    return { ok: true, message: 'Conexão com MySQL funcionando.' };
  } catch (error) {
    return { ok: false, message: `Erro ao conectar no MySQL: ${error.message}` };
  }
}
