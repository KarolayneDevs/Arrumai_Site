/* Funções para deixar valores bonitos na tela. */

// Intl.NumberFormat formata dinheiro no padrão brasileiro: R$ 180,00
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** formatarMoeda(180) -> "R$ 180,00". Sem valor ainda (null) mostra um traço. */
export function formatarMoeda(valor) {
  return valor == null ? '—' : moeda.format(valor);
}

/** formatarTamanho(1048576) -> "1,0 MB". Usado na lista de arquivos enviados. */
export function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
