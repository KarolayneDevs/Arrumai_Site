/* =====================================================================
   "ONDAS DO ENCONTRO DAS ÁGUAS" (padrão gráfico da marca)
   Fundo escuro com grade pontilhada e três faixas onduladas nas cores da
   paleta. Serve de fundo para capas, banners e destaques.
   O conteúdo colocado dentro (children) aparece por cima das ondas.
   ===================================================================== */
export default function Ondas({ children, className = '' }) {
  return (
    <div className={`ondas ${className}`.trim()}>
      {/* As faixas são linhas grossas (strokeWidth) desenhadas com curvas */}
      <svg className="ondas__faixas" viewBox="0 0 400 400" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <path d="M290 -30 C 200 90, 340 210, 250 430" stroke="#CB7C4E" strokeWidth="64" fill="none" />
        <path d="M345 -30 C 255 90, 395 210, 305 430" stroke="#C9A468" strokeWidth="64" fill="none" />
        <path d="M400 -30 C 310 90, 450 210, 360 430" stroke="#7E9473" strokeWidth="64" fill="none" />
      </svg>
      {children}
    </div>
  );
}
