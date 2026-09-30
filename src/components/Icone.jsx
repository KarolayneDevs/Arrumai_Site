/* =====================================================================
   ÍCONES (guia de identidade visual, seção 04)
   Todos são desenhados com linhas (traço), sem preenchimento, para manter
   o visual leve. Cada nome aponta para o desenho (path) correspondente.
   ===================================================================== */
const DESENHOS = {
  documento: (<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></>),
  prazo: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  aprovacao: (<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>),
  envio: (<><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></>),
  atendimento: (<><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" /></>),
  versoes: (<><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 16l9 5 9-5" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

/** Uso: <Icone nome="prazo" tamanho={24} /> */
export default function Icone({ nome, tamanho = 24 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // usa a cor do texto onde o ícone estiver
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DESENHOS[nome]}
    </svg>
  );
}
