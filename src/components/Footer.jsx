import Logo from './Logo';

/* =====================================================================
   RODAPÉ
   Fundo escuro (Rio Negro), slogan da marca e aviso de privacidade (RNF03).
   ===================================================================== */
export default function Footer() {
  return (
    <footer className="rodape">
      <div className="container rodape__interno">
        <div>
          {/* escuro: o fundo é escuro, então o nome da logo fica claro */}
          <Logo tamanho={36} escuro />
          <p className="rodape__slogan">Pensado por você, organizado por nós!</p>
        </div>

        <p className="rodape__aviso">
          Seus arquivos e comprovantes ficam visíveis só para você e para a equipe responsável
          pela sua solicitação. Tratamos seus dados de acordo com a LGPD.
        </p>
      </div>
      <p className="container rodape__direitos">© {new Date().getFullYear()} Arrumaí. Feito em Manaus.</p>
    </footer>
  );
}
