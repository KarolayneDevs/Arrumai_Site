// -----------------------------------------------------------------------------
// UTILITÁRIO DE STATUS
// -----------------------------------------------------------------------------
// Esta utilidade centraliza o fluxo principal da solicitação. Ela ajuda a
// impedir que o sistema avance para um estágio inválido e mantém a regra de
// negócio organizada para a equipe entender o progresso do pedido.
// -----------------------------------------------------------------------------

export const STATUS_ORDEM = [
  'RECEBIDA',
  'EM_ANALISE',
  'PROPOSTA_ENVIADA',
  'AGUARDANDO_PAGAMENTO',
  'PAGAMENTO_CONFIRMADO',
  'EM_ANDAMENTO',
  'CONCLUIDA',
];

export const STATUS_FINAIS = ['RECUSADA', 'CANCELADA'];

export function statusEhValido(status) {
  return [...STATUS_ORDEM, ...STATUS_FINAIS].includes(status);
}

export function podeAvancarStatus(statusAtual, proximoStatus) {
  // Se o status atual já for final, não há transição válida.
  if (STATUS_FINAIS.includes(statusAtual)) {
    return false;
  }

  const indiceAtual = STATUS_ORDEM.indexOf(statusAtual);
  const indiceProximo = STATUS_ORDEM.indexOf(proximoStatus);

  // Se o status novo for final e o atual for qualquer etapa da sequencia,
  // ele pode representar encerramento da solicitação.
  if (STATUS_FINAIS.includes(proximoStatus)) {
    return true;
  }

  // Transição permitida apenas para a próxima etapa da sequência.
  return indiceAtual >= 0 && indiceProximo === indiceAtual + 1;
}

export function statusParaLabel(status) {
  const labels = {
    RECEBIDA: 'Recebida',
    EM_ANALISE: 'Em análise',
    PROPOSTA_ENVIADA: 'Proposta enviada',
    AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
    PAGAMENTO_CONFIRMADO: 'Pagamento confirmado',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    RECUSADA: 'Recusada',
    CANCELADA: 'Cancelada',
  };

  return labels[status] || status;
}
