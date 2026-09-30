import { Link } from 'react-router-dom';

/* =====================================================================
   BOTÃO (guia de identidade visual, seção 04)
   Três variantes:
   - principal:  fundo Pôr do sol, para a ação mais importante ("Aceitar proposta")
   - secundario: só contorno ("Ver detalhes")
   - texto:      sublinhado, para ações leves ("Cancelar")

   Se receber a propriedade "to", vira um link de navegação (<Link>);
   caso contrário, é um <button> comum.
   ===================================================================== */
export default function Botao({ variante = 'principal', to, children, className = '', ...resto }) {
  const classes = `botao botao--${variante} ${className}`.trim();

  // Botão que leva para outra página do site
  if (to) {
    return (
      <Link to={to} className={classes} {...resto}>
        {children}
      </Link>
    );
  }

  // Botão de ação. type="button" evita enviar formulários sem querer;
  // quem precisar de envio passa type="submit" (vai em "...resto").
  return (
    <button type="button" className={classes} {...resto}>
      {children}
    </button>
  );
}
