/* =====================================================================
   LOGO DO ARRUMAÍ (guia de identidade visual, seções 01 e 02)
   - Símbolo: três folhas em leque (recebida, em análise, concluída),
     linhas de texto (padronização ABNT) e o check em verde (aprovado).
   - Wordmark: "arrumaí" em sans bold, com o acento do "í" em Pôr do sol.
   ===================================================================== */

/** Só o símbolo (as folhas). "tamanho" é a largura/altura em pixels. */
export function Simbolo({ tamanho = 40, className = '' }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true" // decorativo: o texto "arrumaí" ao lado já diz o nome
    >
      {/* Folha de trás (Pôr do sol), girada -9° */}
      <rect x="14" y="8" width="34" height="46" rx="5" fill="#CB7C4E" transform="rotate(-9 31 31)" />
      {/* Folha do meio (Solimões), girada -3° */}
      <rect x="14" y="8" width="34" height="46" rx="5" fill="#C9A468" transform="rotate(-3 31 31)" />
      {/* Folha da frente (Papel), com tudo que fica em cima dela */}
      <g transform="rotate(4 31 31)">
        <rect x="15" y="9" width="34" height="46" rx="4" fill="#F8F3E9" />
        {/* Canto recortado: dá o aspecto de folha real */}
        <polygon points="37,9 49,21 37,21" fill="#DFC39A" />
        {/* Três barras = parágrafos alinhados */}
        <rect x="20" y="27" width="22" height="3.5" rx="1.75" fill="#3A2E22" />
        <rect x="20" y="34" width="22" height="3.5" rx="1.75" fill="#3A2E22" />
        <rect x="20" y="41" width="11" height="3.5" rx="1.75" fill="#3A2E22" />
        {/* Selo de aprovação (Mata) */}
        <circle cx="42" cy="47" r="8" fill="#7E9473" />
        <path d="M38 47l3 3 5-6" stroke="#F8F3E9" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/**
 * Logo completa (símbolo + nome).
 * - escuro: true quando o fundo é escuro (o nome fica na cor Papel)
 * - semTexto: mostra só o símbolo
 */
export default function Logo({ tamanho = 40, escuro = false, semTexto = false }) {
  return (
    <span className={`logo ${escuro ? 'logo--escuro' : ''}`}>
      <Simbolo tamanho={tamanho} />
      {!semTexto && (
        // fontSize acompanha o tamanho do símbolo para os dois ficarem proporcionais
        <span className="logo__nome" style={{ fontSize: tamanho * 0.7 }}>
          arruma<span className="logo__acento">í</span>
        </span>
      )}
    </span>
  );
}
