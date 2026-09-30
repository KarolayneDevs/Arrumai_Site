/* =====================================================================
   DADOS DE EXEMPLO (MOCK)
   Ainda não há back-end, então estas solicitações fingem ser a resposta
   de uma API. Quando a API existir, troque o uso desta lista por chamadas
   com fetch() e apague este arquivo.
   ===================================================================== */
export const SOLICITACOES = [
  {
    id: '0231',
    titulo: 'TCC · Enfermagem',
    servico: 'padronizacao',
    norma: 'ABNT NBR 14724',
    status: 'em_andamento',
    valor: 180,
    entregaPrevista: '16/10',
    pagamento: 'Pix',
    // Data em que cada etapa aconteceu (aparece embaixo do nome da etapa)
    datas: {
      recebida: '12/10',
      em_analise: '13/10',
      proposta_enviada: '13/10',
      aguardando_pagamento: '13/10',
      pagamento_confirmado: '14/10',
      em_andamento: '14/10',
      concluida: 'previsto 16/10',
    },
    // RF08 e RF14: conversa entre cliente e equipe dentro da solicitação
    comentarios: [
      { autor: 'equipe', texto: 'Recebemos seu arquivo. Falta só a folha de aprovação assinada.', quando: '13/10' },
      { autor: 'cliente', texto: 'Enviei agora pouco, obrigada!', quando: '13/10' },
    ],
  },
  {
    id: '0232',
    titulo: 'Artigo para periódico',
    servico: 'revisao',
    norma: 'ABNT NBR 6022',
    status: 'proposta_enviada',
    valor: 120,
    entregaPrevista: '22/10',
    pagamento: 'Pix',
    datas: { recebida: '15/10', em_analise: '16/10', proposta_enviada: '16/10' },
    comentarios: [],
  },
  {
    id: '0233',
    titulo: 'Relatório de estágio',
    servico: 'criacao',
    norma: 'Norma da instituição',
    status: 'recebida',
    valor: null, // ainda não há proposta
    entregaPrevista: null,
    pagamento: 'Pix',
    datas: { recebida: '18/10' },
    comentarios: [],
  },
  {
    id: '0198',
    titulo: 'Monografia · Administração',
    servico: 'padronizacao',
    norma: 'ABNT NBR 14724',
    status: 'concluida',
    valor: 220,
    entregaPrevista: '02/09',
    pagamento: 'Pix',
    datas: {
      recebida: '25/08',
      em_analise: '25/08',
      proposta_enviada: '26/08',
      aguardando_pagamento: '26/08',
      pagamento_confirmado: '27/08',
      em_andamento: '27/08',
      concluida: '02/09',
    },
    comentarios: [{ autor: 'equipe', texto: 'Concluída! Seu trabalho está pronto para a banca.', quando: '02/09' }],
  },
];

/** Procura uma solicitação pelo número. Retorna undefined se não existir. */
export function getSolicitacao(id) {
  return SOLICITACOES.find((s) => s.id === id);
}
