/* =====================================================================
   STATUS DA SOLICITAÇÃO (documento de requisitos, "Fluxo de status")
   Recebida > Em análise > Proposta enviada > Aguardando pagamento >
   Pagamento confirmado > Em andamento > Concluída
   Uma solicitação também pode terminar como Recusada ou Cancelada.
   ===================================================================== */

// Etapas do fluxo principal, EM ORDEM. A "chave" é o que o back-end deve enviar;
// o "rotulo" é o texto que o cliente vê na tela.
export const FLUXO = [
  { chave: 'recebida', rotulo: 'Recebida' },
  { chave: 'em_analise', rotulo: 'Em análise' },
  { chave: 'proposta_enviada', rotulo: 'Proposta enviada' },
  { chave: 'aguardando_pagamento', rotulo: 'Aguardando pagamento' },
  { chave: 'pagamento_confirmado', rotulo: 'Pagamento confirmado' },
  { chave: 'em_andamento', rotulo: 'Em andamento' },
  { chave: 'concluida', rotulo: 'Concluída' },
];

// "tom" define a cor do selo (veja .selo--tom no components.css).
// Segue o guia: Solimões = etapas intermediárias, Pôr do sol = ação em curso,
// Mata = conclusão e aprovação.
const TONS = {
  recebida: 'neutro',
  em_analise: 'apoio',
  proposta_enviada: 'apoio',
  aguardando_pagamento: 'apoio',
  pagamento_confirmado: 'destaque',
  em_andamento: 'destaque',
  concluida: 'sucesso',
  recusada: 'encerrado',
  cancelada: 'encerrado',
};

// Status que encerram a solicitação sem passar pelo fluxo completo
const ENCERRADOS = { recusada: 'Recusada', cancelada: 'Cancelada' };

/** Devolve { rotulo, tom } para qualquer status (do fluxo ou encerrado). */
export function getStatusInfo(chave) {
  const etapa = FLUXO.find((e) => e.chave === chave);
  return {
    rotulo: etapa ? etapa.rotulo : ENCERRADOS[chave] ?? 'Desconhecido',
    tom: TONS[chave] ?? 'neutro',
  };
}

/** Posição do status dentro do fluxo (0 a 6). Retorna -1 se for Recusada/Cancelada. */
export function indiceNoFluxo(chave) {
  return FLUXO.findIndex((e) => e.chave === chave);
}

/** true se a solicitação já terminou sem ser concluída (Recusada ou Cancelada). */
export function estaEncerrada(chave) {
  return chave in ENCERRADOS;
}
