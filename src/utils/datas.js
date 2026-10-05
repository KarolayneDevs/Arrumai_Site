/* =====================================================================
   FORMATAÇÃO DE DATAS
   A API devolve datas no formato ISO ("2026-10-05T14:30:00.000Z").
   Estas funções transformam em texto fácil de ler, no horário local.
   ===================================================================== */

/** Formata ISO ou YYYY-MM-DD sem deslocar datas sem horário por fuso local. */
export function formatarData(iso) {
  if (!iso) return '—';
  const somenteData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  const data = somenteData
    ? new Date(Number(somenteData[1]), Number(somenteData[2]) - 1, Number(somenteData[3]))
    : new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso); // não é uma data válida: mostra como veio
  return data.toLocaleDateString('pt-BR');
}

/** formatarDataHora("2026-10-05T14:30:00Z") -> "05/10/2026 14:30". */
export function formatarDataHora(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso);
  return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}